# Spring Boot Cheatsheet

## Key Annotations
| Annotation | Purpose |
|---|---|
| `@SpringBootApplication` | Main class — combines @Configuration, @EnableAutoConfiguration, @ComponentScan |
| `@RestController` | HTTP controller returning data (not views) |
| `@Controller` | MVC controller returning view templates |
| `@Service` | Business logic layer |
| `@Repository` | Data access layer |
| `@Component` | Generic Spring-managed bean |
| `@Autowired` | Inject a dependency |
| `@Value` | Inject a property value |

## Request Mapping
```java
@GetMapping("/path")     // GET
@PostMapping("/path")    // POST
@PutMapping("/path")     // PUT
@DeleteMapping("/path")  // DELETE
@RequestMapping("/path") // Any method
```

## application.properties
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost/mydb
spring.jpa.hibernate.ddl-auto=update
```