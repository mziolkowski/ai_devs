# ai_devs_2

Ten projekt został stworzony przy użyciu `bun init` w wersji bun v1.0.33. [Bun](https://bun.sh) to szybkie, wszechstronne środowisko uruchomieniowe JavaScript.

Aby zainstalować zależności:

```bash
bun install
```

**Przed uruchomieniem**
Musisz dostarczyć informacje o swoim projekcie.



**Aby uruchomić:** 
Dodaj nazwę zadania (`task_name`) w pliku `package.json` oraz ścieżkę do pliku TypeScript (TS file).

```json
"scripts": {
    "start": "bun src/utils/utils.ts",
    "helloapi": "bun src/exercises/helloapi.ts",
    "moderation": "bun src/exercises/moderate.ts",
    "blogger": "bun src/exercises/blogger.ts",
    "liar": "bun src/exercises/liar.ts"
  }
```
Następnie w terminalu wpisz:
```bash
bun helloapi
```