# --- Build stage ---
FROM eclipse-temurin:17-jdk AS build
COPY . /source
WORKDIR /source
RUN mvn clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jre
COPY --from=build /source/target/cinebook-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9898
ENTRYPOINT ["java", "-jar", "app.jar"]
