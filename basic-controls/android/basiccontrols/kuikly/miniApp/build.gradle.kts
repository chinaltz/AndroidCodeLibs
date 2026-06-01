import java.nio.file.Paths

plugins {
    kotlin("multiplatform")
}

kotlin {
    js(IR) {
        browser {
            webpackTask {
                outputFileName = "miniprogramApp.js"
            }
            commonWebpackConfig {
                output?.library = null
                devtool = null
            }
        }
        binaries.executable()
    }

    sourceSets {
        val jsMain by getting {
            dependencies {
                implementation(project(":core-render-web:base"))
                implementation(project(":core-render-web:miniapp"))
            }
        }
    }
}

val businessPathName = "shared"

fun copyLocalJSBundle(buildSubPath: String) {
    val destDir = Paths.get(project.buildDir.absolutePath, "../", "dist", "business").toFile()
    if (destDir.exists()) {
        destDir.deleteRecursively()
    }
    destDir.mkdirs()

    val sourceDir = Paths.get(
        project.rootDir.absolutePath,
        businessPathName,
        "build/dist/js",
        buildSubPath,
    ).toFile()

    project.copy {
        from(sourceDir) {
            include("nativevue2.js")
        }
        into(destDir)
    }
}

project.afterEvaluate {
    tasks.register("generateWebpackConfig") {
        group = "kuikly"
        description = "Generate mini program webpack configuration."

        doLast {
            val configDir = File(projectDir.absolutePath, "webpack.config.d")
            configDir.mkdirs()
            File(configDir, "config.js").writeText("config.target = 'node';")
        }
    }

    tasks.named("compileKotlinJs") {
        dependsOn("generateWebpackConfig")
    }
    tasks.named("jsBrowserDevelopmentWebpack") {
        dependsOn("generateWebpackConfig")
        finalizedBy("syncRenderDevelopmentToDist")
    }
    tasks.named("jsBrowserProductionWebpack") {
        dependsOn("generateWebpackConfig")
        finalizedBy("syncRenderProductionToDist")
    }

    tasks.register<Copy>("syncRenderProductionToDist") {
        from("$buildDir/kotlin-webpack/js/productionExecutable")
        into("$projectDir/dist/lib")
        include("**/*.js", "**/*.d.ts")
    }

    tasks.register<Copy>("syncRenderDevelopmentToDist") {
        from("$buildDir/kotlin-webpack/js/developmentExecutable")
        into("$projectDir/dist/lib")
        include("**/*.js", "**/*.d.ts")
    }

    tasks.register<Copy>("copyAssets") {
        from(Paths.get(project.rootDir.absolutePath, businessPathName, "src/commonMain/assets").toFile())
        into("$projectDir/dist/assets")
        include("**/**")
    }

    tasks.register("jsMiniAppDevelopmentWebpack") {
        group = "kuikly"
        dependsOn("jsBrowserDevelopmentWebpack")
        copyLocalJSBundle("developmentExecutable")
    }

    tasks.register("jsMiniAppProductionWebpack") {
        group = "kuikly"
        dependsOn("jsBrowserProductionWebpack")
        copyLocalJSBundle("productionExecutable")
    }
}
