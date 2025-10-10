# Use official OpenJDK 17
FROM openjdk:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy jar file into container
COPY target/project-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]