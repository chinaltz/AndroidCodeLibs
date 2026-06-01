plugins {
    kotlin("multiplatform") version "2.1.21" apply false
    kotlin("plugin.compose") version "2.1.21" apply false
    id("com.android.library") version "7.4.2" apply false
    id("org.jetbrains.compose") version "1.7.3" apply false
    id("com.google.devtools.ksp") version "2.1.21-2.0.1" apply false
}

buildscript {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
        maven {
            url = uri("https://mirrors.tencent.com/repository/maven-tencent/")
        }
    }
    dependencies {
        classpath("com.tencent.kuikly-open:core-gradle-plugin:2.14.1-2.0.21")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://mirrors.tencent.com/repository/maven-tencent/")
        }
    }
    configurations.all {
        resolutionStrategy.dependencySubstitution {
            substitute(module("com.tencent.kuikly-open:compose")).using(project(":compose"))
        }
    }
}
