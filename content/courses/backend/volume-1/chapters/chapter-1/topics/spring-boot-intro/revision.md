# Spring Boot — Revision Notes

## @SpringBootApplication = 3 Annotations
- `@SpringBootConfiguration` — marks config class
- `@EnableAutoConfiguration` — enables auto-config
- `@ComponentScan` — scans current package for beans

## Common Starters
| Starter | Provides |
|---|---|
| spring-boot-starter-web | REST APIs, embedded Tomcat |
| spring-boot-starter-data-jpa | Hibernate, JPA repositories |
| spring-boot-starter-security | Spring Security |
| spring-boot-starter-test | JUnit 5, Mockito, AssertJ |

## Layers in a Spring Boot App
Controller → Service → Repository → Database