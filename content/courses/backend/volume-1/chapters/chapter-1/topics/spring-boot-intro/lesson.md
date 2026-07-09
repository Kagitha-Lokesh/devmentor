# Introduction to Spring Boot

## Learning Objectives
- Understand what Spring Boot is and its advantages over plain Spring.
- Create a Spring Boot project and run it.
- Understand auto-configuration and the starter dependency model.

---

## What is Spring Boot?
Spring Boot is an **opinionated, production-ready** framework built on top of the Spring Framework. It eliminates most of the boilerplate configuration that traditional Spring required.

**Without Spring Boot**: 100s of lines of XML configuration
**With Spring Boot**: Zero XML, runs in seconds

---

## Core Features

### 1. Auto-Configuration
Spring Boot automatically configures your application based on the dependencies you add. Add `spring-boot-starter-web` → it auto-configures an embedded Tomcat server, Spring MVC, and Jackson JSON.

### 2. Starter Dependencies
Curated dependency bundles — instead of figuring out 10 compatible libraries, add ONE starter:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 3. Embedded Server
No need to deploy a WAR to external Tomcat. Spring Boot packages an embedded server and you run it as a plain Java application:
```bash
java -jar myapp.jar
```

---

## Your First Spring Boot App

```java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }
}

@RestController
class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot!";
    }
}
```
Run it → visit `http://localhost:8080/hello` → see "Hello from Spring Boot!"