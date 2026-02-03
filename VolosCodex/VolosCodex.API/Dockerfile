# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER root
# Install libgomp1 which is often required by OnnxRuntime on Linux
RUN apt-get update && apt-get install -y libgomp1
WORKDIR /app
# Create directories and set permissions
# We set 777 for LocalEmbeddingsModel to ensure the app can write/download the model regardless of user context
RUN mkdir -p /app/Books /app/LocalEmbeddingsModel && \
    chmod -R 777 /app/LocalEmbeddingsModel

# Set HOME to /app to ensure any user-level caching goes to a writable location
ENV HOME=/app

# Temporarily running as root to bypass permission issues with OnnxRuntime/LocalEmbeddings
# USER $APP_UID
EXPOSE 8080
EXPOSE 8081


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["VolosCodex.API/VolosCodex.Api.csproj", "VolosCodex.API/"]
COPY ["VolosCodex.Application/VolosCodex.Application.csproj", "VolosCodex.Application/"]
COPY ["VolosCodex.Domain/VolosCodex.Domain.csproj", "VolosCodex.Domain/"]
COPY ["VolosCodex.Infrastructure/VolosCodex.Infrastructure.csproj", "VolosCodex.Infrastructure/"]
RUN dotnet restore "./VolosCodex.API/VolosCodex.Api.csproj"
COPY . .
WORKDIR "/src/VolosCodex.API"
RUN dotnet build "./VolosCodex.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./VolosCodex.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY ["VolosCodex.Domain/Books", "/app/Books"]
ENTRYPOINT ["dotnet", "VolosCodex.Api.dll"]