import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Brain, 
  Clock, 
  Layers,
  ChevronRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { container } from '../../../infrastructure/di/container';
import { useAuthStore } from '../../store/useAuthStore';
import { eventBus } from '../../../shared/events/EventBus';
import revisionIndex from '../../../shared/generated/revision-index.json';

export default function FlashcardSession() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const uid = user?.uid || 'anonymous';

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [cardsWithState, setCardsWithState] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [results, setResults] = useState([]); // Array of RevisionResult values
  const [reviewMode, setReviewMode] = useState('normal'); // 'normal' | 'random' | 'quick' | 'bookmarks'
  const [topicDetails, setTopicDetails] = useState(null);

  // Timers
  const sessionStartTime = useRef(Date.now());
  const cardStartTime = useRef(Date.now());

  const revisionUseCase = container.resolve('RevisionUseCase');

  // Find topicId from slug
  const match = revisionIndex.find((r) => r.slug === topicSlug);
  const topicId = match ? match.topicId : null;

  useEffect(() => {
    if (!topicId) {
      navigate('/revision');
      return;
    }

    async function loadFlashcards() {
      setIsLoading(true);
      try {
        const list = await revisionUseCase.getFlashcardsForTopic(uid, topicId);
        setCardsWithState(list);
        
        // Find static topic title
        const graph = container.resolve('IKnowledgeGraphRepository');
        const nodes = await graph.getGraph();
        const node = nodes.find((n) => n.id === topicId);
        if (node) {
          setTopicDetails(node);
        }
      } catch (err) {
        console.error('Error fetching topic flashcards:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFlashcards();
  }, [topicId, uid]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionCompleted || isLoading || cardsWithState.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRateCard(0); // Again
        } else if (e.key === '2') {
          e.preventDefault();
          handleRateCard(1); // Hard
        } else if (e.key === '3') {
          e.preventDefault();
          handleRateCard(2); // Good
        } else if (e.key === '4') {
          e.preventDefault();
          handleRateCard(3); // Easy
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionCompleted, isLoading, cardsWithState]);

  if (isLoading) {
    return <FlashcardSessionSkeleton />;
  }

  // Filter and mode logic configurations
  const getProcessedCards = () => {
    let list = [...cardsWithState];
    if (reviewMode === 'random') {
      // Shuffle list
      return list.sort(() => Math.random() - 0.5);
    } else if (reviewMode === 'quick') {
      // Take only first 5 cards due
      return list.slice(0, 5);
    }
    return list;
  };

  const processedCards = getProcessedCards();
  const currentCardEntry = processedCards[activeIdx];

  const handleRateCard = async (rating) => {
    const timeSpent = Math.round((Date.now() - cardStartTime.current) / 1000);
    const flashcardId = currentCardEntry.card.id;
    const isCorrect = rating >= 2; // Good or Easy classified as correct

    // 1. Submit card review to update engine state
    const updatedCard = await revisionUseCase.submitCardReview(uid, flashcardId, topicId, rating, timeSpent);
    
    // Accumulate results
    const newResults = [...results, {
      flashcardId,
      rating,
      timeSpent,
      isCorrect
    }];
    setResults(newResults);

    // 2. Publish card flip analytics event
    eventBus.publish('FLASHCARD_FLIPPED', { uid, topicId });

    setIsFlipped(false);
    if (activeIdx < processedCards.length - 1) {
      setActiveIdx(activeIdx + 1);
      cardStartTime.current = Date.now();
    } else {
      // End session and compile stats
      const totalDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
      await revisionUseCase.completeRevisionSession(uid, topicId, newResults, totalDuration);
      setSessionCompleted(true);
    }
  };

  const resetSession = () => {
    setActiveIdx(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setResults([]);
    sessionStartTime.current = Date.now();
    cardStartTime.current = Date.now();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Navigation and Title */}
      <div className="flex justify-between items-center border-b border-default pb-4">
        <button 
          onClick={() => navigate('/revision')}
          className="flex items-center gap-1 text-xs font-bold text-muted hover:text-primary uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <span className="text-xs text-muted font-bold uppercase tracking-wider">
          {topicDetails ? topicDetails.title : 'Revision Session'}
        </span>
      </div>

      {sessionCompleted ? (
        <div className="bg-surface border border-default rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="inline-flex p-4 bg-emerald-950/80 border border-emerald-850 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-primary">Revision Complete!</h2>
            <p className="text-muted text-xs max-w-sm mx-auto">
              Your memory retrieval stats have been synced to the database. Spaced Repetition scheduling has adjusted.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-surface p-4 rounded-xl border border-default">
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Reviewed</span>
              <strong className="text-lg text-primary font-black">{results.length}</strong>
            </div>
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Accuracy</span>
              <strong className="text-lg text-emerald-400 font-black">
                {Math.round((results.filter((r) => r.isCorrect).length / results.length) * 100)}%
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Recall time</span>
              <strong className="text-lg text-brand-400 font-black">
                {Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length)}s
              </strong>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-950 border border-brand-850 rounded-full text-brand-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Memory Retention Index Upgraded</span>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={resetSession}
              className="flex-1 btn-secondary text-xs py-3 flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Session
            </button>
            <button 
              onClick={() => navigate('/revision')}
              className="flex-1 btn-primary text-xs py-3 flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              Finish Review
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : processedCards.length === 0 ? (
        <div className="bg-surface border border-default rounded-2xl p-12 text-center space-y-4">
          <Brain className="h-10 w-10 text-muted mx-auto" />
          <h3 className="text-lg font-bold text-primary">No Flashcards Available</h3>
          <p className="text-xs text-muted max-w-xs mx-auto">
            This topic does not contain any compiled flashcard items in its configuration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deck Toolbar and Modes selector */}
          <div className="flex justify-between items-center bg-surface border border-default/80 px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Mode:</span>
              <select
                value={reviewMode}
                onChange={(e) => {
                  setReviewMode(e.target.value);
                  resetSession();
                }}
                className="bg-surface border border-default text-[10px] text-primary font-bold uppercase px-2 py-1 rounded focus:outline-none"
              >
                <option value="normal">Normal Order</option>
                <option value="random">Shuffle deck</option>
                <option value="quick">Quick (5 cards)</option>
              </select>
            </div>
            <div className="text-[10px] text-muted font-bold uppercase tracking-wider">
              Card {activeIdx + 1} of {processedCards.length}
            </div>
          </div>

          {/* Flashcard container with inline CSS flip effect */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative w-full h-80 cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            <div 
              className="absolute w-full h-full transition-transform duration-500"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute w-full h-full bg-surface border border-default rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-2xl backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                  <span>Front (Question)</span>
                  {currentCardEntry.state && (
                    <span className="text-brand-400">EF: {currentCardEntry.state.easeFactor.toFixed(1)}</span>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center px-4">
                  <h3 className="text-lg md:text-xl font-bold text-primary leading-snug">
                    {currentCardEntry.card.front}
                  </h3>
                </div>

                <div className="text-xs font-bold text-muted border border-default bg-surface px-3 py-1.5 rounded-full flex items-center gap-1.5 group-hover:text-brand-300 group-hover:border-brand-800 transition-colors">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Click or press SPACE to flip</span>
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute w-full h-full bg-surface border border-default rounded-2xl p-8 flex flex-col justify-between items-center text-center shadow-2xl backface-hidden"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-full text-left text-[10px] text-muted font-bold uppercase tracking-wider">
                  Back (Answer)
                </div>

                <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
                  <p className="text-sm md:text-base text-muted leading-relaxed font-semibold">
                    {currentCardEntry.card.back}
                  </p>
                </div>

                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">
                  How well did you recall this?
                </div>
              </div>
            </div>
          </div>

          {/* Spaced repetition rating controls */}
          {isFlipped ? (
            <div className="grid grid-cols-4 gap-2 animate-fade-in">
              <button
                onClick={() => handleRateCard(0)}
                className="flex flex-col items-center gap-0.5 py-2.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/60 rounded-xl text-red-400 font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="text-base">1</span>
                <span>Again</span>
              </button>
              <button
                onClick={() => handleRateCard(1)}
                className="flex flex-col items-center gap-0.5 py-2.5 bg-amber-950/20 hover:bg-amber-950/50 border border-amber-900/60 rounded-xl text-amber-400 font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="text-base">2</span>
                <span>Hard</span>
              </button>
              <button
                onClick={() => handleRateCard(2)}
                className="flex flex-col items-center gap-0.5 py-2.5 bg-brand-950/20 hover:bg-brand-950/50 border border-brand-900/60 rounded-xl text-brand-400 font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="text-base">3</span>
                <span>Good</span>
              </button>
              <button
                onClick={() => handleRateCard(3)}
                className="flex flex-col items-center gap-0.5 py-2.5 bg-emerald-950/20 hover:bg-emerald-950/50 border border-emerald-900/60 rounded-xl text-emerald-400 font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="text-base">4</span>
                <span>Easy</span>
              </button>
            </div>
          ) : (
            <div className="text-center text-[10px] text-muted font-semibold uppercase tracking-wider">
              Flip the card to reveal options
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlashcardSessionSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-pulse">
      <div className="h-10 border-b border-default/40" />
      <div className="bg-surface/50 border border-default/40 h-80 rounded-2xl" />
      <div className="h-12 bg-surface/50 rounded-xl" />
    </div>
  );
}
