# Pixel Patch: Alpha Computer — Snapshot 1

Pixel-artowy symulator serwisu komputerowego. **Snapshot 1** to najnowsza wersja Alpha Computer; starsze buildy zostają online.

- **Strona:** https://tznsec.github.io/PixelPatch/
- **Snapshot 1 (v0.12-snapshot1):**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.12-snapshot1/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.12-snapshot1/PixelPatch.apk
- **Alpha Computer 0.11-alpha:**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.11-alpha/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.11-alpha/PixelPatch.apk
- **Garage Days 0.9.7:**
  - PC: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.exe
  - Android: https://github.com/tznsec/PixelPatch/releases/download/v0.9.7/PixelPatch.apk

## Wyzwanie

TZNsec i K2STUDIO wybrały po jednym przedstawicielu — **V0idVex** i **Kormeliuszk**. To oni rzucili sobie wyzwanie: w 365 dni zrobić grę od zera i doprowadzić ją do premiery na Steam. Pixel Patch jest publicznym zapisem tej drogi.

## Co nowego w Snapshot 1

- **Płyta główna w naprawie** — widać PCB, CPU, RAM, GPU, PSU i dysk; aktywny podzespół jest podświetlony.
- **Jakość naprawy** — combo, błędy i jakość wpływają na bonus do wypłaty.
- **Skrzyżowania i pasy** — drogi poprzeczne, przejścia, sygnalizacja i poprawne pasy ruchu.
- **Auto na pasie** — prawy pas, zawracanie `R` / `A-D` przy hamowaniu, efekty szybkiej jazdy.
- **Późny poradnik** — po pierwszym zleceniu prowadzi krok po kroku przez recepcję, warsztat, części, umowę i podatek.
- **Podatki i bank** — cotygodniowy podatek, termin i kara; płatność w banku.
- **Umowy z podpisami** — każda skończona naprawa tworzy umowę z kwotą, jakością i podpisem.
- **Trzy dystrykty** — Centrum, Port i Stare Miasto; zmiana na dworcu.
- **Klienci mogą odrzucić ofertę** — zbyt agresywna cena może zakończyć negocjację.

## Sterowanie

PC: WASD/strzałki — ruch, Shift — bieg, E — akcja, Tab — ekwipunek, P — telefon, B — warsztat, I — sklep, F — użycie, 1–9 — hotbar, Q — zmiana zlecenia, R — zawrócenie auta, T — czat (multiplayer), F5/F9 — zapis/odczyt.

Android: joystick, TEL / UZYJ / EKWIP. / AKCJA / Q ZLEC. / CZAT / ZAWROT, X w menu, II — pauza, dotyk w minigrach naprawy.

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

TZNsec & K2STUDIO · V0idVex & Kormeliuszk. Strona i buildy: GitHub Pages + GitHub Releases.
