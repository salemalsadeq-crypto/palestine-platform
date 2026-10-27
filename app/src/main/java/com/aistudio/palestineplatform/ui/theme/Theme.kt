package com.aistudio.palestineplatform.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = NavyPrimary,
    onPrimary = Color.White,
    primaryContainer = NavyLight,
    onPrimaryContainer = Color.White,
    secondary = PalestineGreen,
    onSecondary = Color.White,
    background = SlateBackground,
    onBackground = TextDark,
    surface = CardSurface,
    onSurface = TextDark,
    error = PalestineRed,
    onError = Color.White
)

@Composable
fun PalestinePlatformTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
