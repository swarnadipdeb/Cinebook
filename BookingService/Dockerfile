# --- Build stage ---
FROM maven:3-openjdk-17-slim AS build
COPY . /source
WORKDIR /source
RUN mvn clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jre
COPY --from=build /source/target/bookingService-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9830
ENTRYPOINT ["java", "-jar", "app.jar"]
