# Spring Boot — Code Examples

## A simple REST endpoint
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<String> getAll() {
        return List.of("Alice", "Bob", "Charlie");
    }

    @GetMapping("/{id}")
    public String getById(@PathVariable Long id) {
        return "User " + id;
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody String name) {
        return ResponseEntity.status(201).body("Created: " + name);
    }
}
```