# Pixel Patch: Alpha Computer

Pixel-artowy symulator serwisu komputerowego. **Alpha Computer** to najnowsza wersja gry; starsza **Garage Days** wciąż jest dostępna.

- **Strona:** https://tznsec.github.io/PixelPatch/
- **Alpha Computer (v0.10-alpha):**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.10-alpha/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.10-alpha/PixelPatch.apk
- **Garage Days (v0.9.7):**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.apk

## Co nowego w Alpha Computer

- **Naprawy na telefonie** — dotykowe przyciski W/A/S/D w minigrze sekwencji, reszta napraw klikana.
- **Pracownicy** — mechanik, sprzedawca i technik; technik sam naprawia komputery, zużywa części i dolicza je do rachunku.
- **Magazyn z tierami** — części T1/T2/T3; tania część nie naprawi już drogiego podzespołu. Magazyn ma pojemność i ekran sprzedaży.
- **Większe miasto** — kasyno, kino, siłownia, hotel, pizzeria, myjnia i sklep z meblami; przejścia dla pieszych, auta NPC i rozmowy z przechodniami.
- **Widok F1** — po wsiadnięciu do auta gra przełącza się na pseudo-3D jazdę: gaz/hamulec, skręt, ruch uliczny i skrzyżowania.
- **Sportowe auto** — do kupienia w warsztacie; szybsze i z innym wyglądem.
- **Nieruchomości i meble** — większy lokal (kolejka 4 zleceń), własny dom (sen +35 energii), kupowanie i ustawianie foteli, lamp, dywanów, automatów i plakatów.
- **Telefon** — nowe aplikacje: bank, sklep, zlecenia, muzyka, mapa i powrót do domu.
- **Wersja** — menu i boot pokazują `ALPHA COMPUTER`.

## Sterowanie

PC: WASD/strzałki — ruch, Shift — bieg, E — akcja, Tab — ekwipunek, P — telefon, B — warsztat, I — sklep, F — użycie, 1–9 — hotbar, F5/F9 — zapis/odczyt.

Android: joystick, TEL / UZYJ / EKWIP. / AKCJA, X w menu, II — pauza, dotyk w minigrach naprawy.

## Struktura

```
scripts/main.gd        # gra (proceduralna grafika, UI, minigry, multiplayer)
scripts/economy.gd     # ekonomia, magazyn, tiery części
scripts/computer.gd    # komputery klientów i tiery podzespołów
scenes/main.tscn       # scena główna
Strona/                # statyczna strona projektu (GitHub Pages)
```

## Build

Godot 4.7.2, GL Compatibility. Eksport: Windows x86_64 i Android arm64 (debug APK).

## Credits

TZNsec & K2STUDIO. Strona i buildy: GitHub Pages + GitHub Releases.
