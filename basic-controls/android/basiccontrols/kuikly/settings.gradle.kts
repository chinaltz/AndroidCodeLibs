pluginManagement {
    repositories {
        google()
        gradlePluginPortal()
        mavenCentral()
        maven {
            url = uri("https://mirrors.tencent.com/repository/maven-tencent/")
        }
        maven {
            url = uri("https://mirrors.tencent.com/nexus/repository/gradle-plugins/")
        }
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://mirrors.tencent.com/repository/maven-tencent/")
        }
    }
}

rootProject.name = "PhonicsPlanetKuikly"

include(":shared")
include(":miniApp")

val kuiklyUiDir = file(System.getenv("KUIKLY_UI_DIR") ?: "/tmp/KuiklyUI")
if (kuiklyUiDir.exists()) {
    val kuiklyBuildFileName = "build.2.1.21.gradle.kts"

    include(":core")
    project(":core").projectDir = file("${kuiklyUiDir.absolutePath}/core")
    project(":core").buildFileName = kuiklyBuildFileName

    include(":core-annotations")
    project(":core-annotations").projectDir = file("${kuiklyUiDir.absolutePath}/core-annotations")
    project(":core-annotations").buildFileName = kuiklyBuildFileName

    include(":core-ksp")
    project(":core-ksp").projectDir = file("${kuiklyUiDir.absolutePath}/core-ksp")
    project(":core-ksp").buildFileName = kuiklyBuildFileName

    include(":compose")
    project(":compose").projectDir = file("${kuiklyUiDir.absolutePath}/compose")
    project(":compose").buildFileName = kuiklyBuildFileName

    include(":core-render-web:base")
    project(":core-render-web:base").projectDir = file("${kuiklyUiDir.absolutePath}/core-render-web/base")

    include(":core-render-web:miniapp")
    project(":core-render-web:miniapp").projectDir = file("${kuiklyUiDir.absolutePath}/core-render-web/miniapp")

    include(":core-render-android")
    project(":core-render-android").projectDir = file("${kuiklyUiDir.absolutePath}/core-render-android")
    project(":core-render-android").buildFileName = kuiklyBuildFileName
}
