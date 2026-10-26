# Pixel Patch: Alpha Computer

Pixel-artowy symulator serwisu komputerowego. **Alpha Computer** to najnowsza wersja gry; starsze **Garage Days** i poprzednie buildy zostają online.

- **Strona:** https://tznsec.github.io/PixelPatch/
- **Alpha Computer 0.11-alpha:**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.11-alpha/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.11-alpha/PixelPatch.apk
- **Alpha Computer 0.10-alpha:**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.10-alpha/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.10-alpha/PixelPatch.apk
- **Garage Days 0.9.7:**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.apk

## Wyzwanie

TZNsec i K2STUDIO rzucili sobie wyzwanie: w 365 dni zrobić grę od zera i doprowadzić ją do premiery na Steam. Pixel Patch jest publicznym zapisem tej drogi — kolejne buildy, devlog i liczniki projektu.

## Co nowego w 0.11-alpha

- **Co-op** — wspólny portfel, te same zlecenia, czat `T`, wymiana pieniędzy `E` na innym graczu.
- **Auta innych graczy** — widoczne w mieście i w widoku jazdy.
- **Minimapa i budynki** — w widoku F1 widać trasę, przystanki i odległość do najbliższego budynku.
- **Dzień i noc oraz 4 pory roku** — deszcz, liście, śnieg, światła i zmiana nieba.
- **Wnętrza kasyna i szpitala** — automaty, ruletka, bar, lekarz, łóżko i apteka.
- **Zdrowie i potrącenia** — auta mogą potrącić gracza, szpital leczy.
- **Q do przełączania zleceń** — na PC i przyciskiem na mobile.
- **Szlif HUD i układu ekranu.**

## Sterowanie

PC: WASD/strzałki — ruch, Shift — bieg, E — akcja, Tab — ekwipunek, P — telefon, B — warsztat, I — sklep, F — użycie, 1–9 — hotbar, Q — zmiana zlecenia, T — czat (multiplayer), F5/F9 — zapis/odczyt.

Android: joystick, TEL / UZYJ / EKWIP. / AKCJA / Q ZLEC. / CZAT, X w menu, II — pauza, dotyk w minigrach naprawy.

## Struktura

```
scripts/main.gd        # gra (proceduralna grafika, UI, minigry, multiplayer)
scripts/economy.gd     # ekonomia, magazyn, tiery części
scripts/customer.gd    # klienci i zlecenia
scripts/computer.gd    # komputery klientów i tiery podzespołów
scenes/main.tscn       # scena główna
tests/smoke_test.gd    # testy dymne
Strona/                # statyczna strona projektu (GitHub Pages)
```

## Build

Godot 4.7.2, GL Compatibility. Eksport: Windows x86_64 i Android arm64 (debug APK).

## Credits

TZNsec & K2STUDIO. Strona i buildy: GitHub Pages + GitHub Releases.
