package com.fchnoticias.app

import com.google.androidbrowserhelper.trusted.LauncherActivity

/**
 * MainActivity para Trusted Web Activity
 * Lanza la PWA de FCH Noticias en modo fullscreen
 */
class MainActivity : LauncherActivity() {
    override fun getLaunchingUrl() = "https://fchnoticias.vercel.app"
}
