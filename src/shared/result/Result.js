export class Result {
  constructor(status, data = null, error = null) {
    this.status = status; // 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'refreshing'
    this.data = data;
    this.error = error;
  }

  static idle() {
    return new Result('idle');
  }

  static loading() {
    return new Result('loading');
  }

  static success(data) {
    if (data === undefined || data === null || (Array.isArray(data) && data.length === 0)) {
      return new Result('empty', data);
    }
    return new Result('success', data);
  }

  static empty() {
    return new Result('empty');
  }

  static failure(error) {
    return new Result('error', null, error);
  }

  static refreshing(data = null) {
    return new Result('refreshing', data);
  }

  get isIdle() {
    return this.status === 'idle';
  }

  get isLoading() {
    return this.status === 'loading';
  }

  get isSuccess() {
    return this.status === 'success';
  }

  get isEmpty() {
    return this.status === 'empty';
  }

  get isFailure() {
    return this.status === 'error';
  }

  get isRefreshing() {
    return this.status === 'refreshing';
  }

  // Helper to extract or throw if error
  unwrap() {
    if (this.isFailure) {
      throw this.error;
    }
    return this.data;
  }
}
