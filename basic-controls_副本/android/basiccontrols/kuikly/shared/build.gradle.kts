plugins {
    kotlin("multiplatform")
    kotlin("plugin.compose")
    id("com.android.library")
    id("com.google.devtools.ksp")
    id("org.jetbrains.compose")
    id("com.tencent.kuikly-open.kuikly")
}

group = "com.techskillplanet.phonics"
version = "1.0.0"

description = "TechSkillPlanet Kuikly shared UI library and samples."

kotlin {
    androidTarget()

    js(IR) {
        moduleName = "nativevue2"
        browser {
            webpackTask {
                outputFileName = "nativevue2.js"
            }
            commonWebpackConfig {
                output?.library = null
                devtool = null
            }
        }
        binaries.executable()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(project(":core"))
                implementation(project(":compose"))
                implementation(project(":core-annotations"))
            }
        }
    }
}

ksp {
    arg("pageName", "")
    arg("pageNameList", "")
    arg("packLocalJSBundle", "")
}

android {
    namespace = "com.techskillplanet.phonics.kuikly.shared"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
    }

    sourceSets {
        named("main") {
            manifest.srcFile("src/androidMain/AndroidManifest.xml")
            assets.srcDirs("src/commonMain/assets")
        }
    }
}

kuikly {
    js {
        outputName("nativevue2")
    }
}

dependencies {
    compileOnly(project(":core-ksp")) {
        add("kspJs", this)
    }
}
