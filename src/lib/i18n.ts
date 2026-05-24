import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        loading: "Loading...",
        search: "Search...",
        noResults: "No titles found",
        beginSearch: "Search for a title to begin.",
        signout: "Sign Out",
        back: "Back",
        plot: "Synopsis",
        director: "Director",
        creator: "Creator",
        cast: "Top Cast",
        providers: "Where to Watch",
        recommendations: "You might also like",
        inLibrary: "In Library",
        addToWatchlist: "Add to Watchlist",
        playTrailer: "Play Trailer",
        released: "Released",
        upcoming: "Upcoming",
        match: "Match",
        series: "Series",
        movie: "Movie",
        type: "Type"
      },
      nav: {
        home: "Home",
        favorites: "Favorites",
        watched: "Watched",
        diary: "Diary",
        series: "Series",
        lists: "Lists",
        achievements: "Achievements",
        statistics: "Statistics"
      },
      diary: {
        title: "Diary",
        subtitle: "Your viewing history",
        today: "Today",
        yesterday: "Yesterday",
        thisWeek: "This Week",
        earlier: "Earlier",
        noEntries: "No diary entries yet",
        logFirst: "Mark a movie as watched to start your diary",
        entry: "watched",
        rated: "rated",
        activity: "Activity",
        currentWatches: "Currently Watching",
      },
      series: {
        title: "TV Series",
        episodes: "Episodes",
        season: "Season",
        progress: "Progress",
        resume: "Resume",
        noSeries: "No TV series in your library",
        episode: "Episode",
        overview: "Overview",
      },
      auth: {
        welcome: "Welcome to InFocus Family CineLog",
        subtitle: "Your personal cinema logbook",
        login: "Sign In",
        signup: "Sign Up",
        email: "Email Address",
        password: "Password",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        forgotPassword: "Forgot Password?",
        resetPasswordTitle: "Reset your password",
        sendInstructions: "Send Instructions",
        resetSuccess: "Password reset instructions sent to your email.",
        admin: "Admin",
        manager: "Manager"
      },
      stats: {
        total: "Total",
        watched: "Watched",
        hours: "Hours",
        genres: "Favorite Genres",
        timeline: "Timeline"
      },
      profile: {
        title: "Profile & Settings",
        tabProfile: "Profile",
        tabSettings: "Settings",
        tabData: "Data",
        tabAppearance: "Appearance",
        displayName: "Display Name",
        email: "Email",
        role: "Role",
        save: "Save Changes",
        generateAvatar: "Generate Avatar",
        removeAvatar: "Remove Avatar",
        theme: "Theme",
        themeLight: "Light",
        themeDark: "Dark",
        themeGlass: "Glassmorphism",
        language: "Language",
        changePassword: "Change Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        updatePassword: "Update Password",
        passwordMatchError: "Passwords do not match.",
        passwordLengthError: "Password must be at least 6 characters.",
        passwordSuccess: "Password updated successfully!",
        export: "Export Watchlist",
        import: "Import Watchlist",
        importDesc: "Restore your list from a file. (Admin only)",
        exportDesc: "Download your watchlist as a JSON file.",
        clearCache: "Clear App Cache",
        version: "Version",
        adminArea: "Admin Area"
      }
    }
  },
  de: {
    translation: {
      common: {
        loading: "Lädt...",
        search: "Suchen...",
        noResults: "Keine Titel gefunden",
        beginSearch: "Suche nach einem Titel, um zu starten.",
        signout: "Abmelden",
        back: "Zurück",
        plot: "Handlung",
        director: "Regie",
        creator: "Ersteller",
        cast: "Besetzung",
        providers: "Wo zu sehen",
        recommendations: "Das könnte dir auch gefallen",
        inLibrary: "In der Mediathek",
        addToWatchlist: "Auf die Watchlist",
        playTrailer: "Auf YouTube öffnen",
        released: "Veröffentlicht",
        upcoming: "Demnächst",
        match: "Übereinstimmung",
        series: "Serie",
        movie: "Film",
        type: "Typ"
      },
      nav: {
        home: "Start",
        favorites: "Favoriten",
        watched: "Gesehen",
        diary: "Tagebuch",
        series: "Serien",
        lists: "Listen",
        achievements: "Erfolge",
        statistics: "Statistiken"
      },
      diary: {
        title: "Tagebuch",
        subtitle: "Dein Verlauf",
        today: "Heute",
        yesterday: "Gestern",
        thisWeek: "Diese Woche",
        earlier: "Früher",
        noEntries: "Noch keine Einträge",
        logFirst: "Markiere einen Film als gesehen, um dein Tagebuch zu starten",
        entry: "gesehen",
        rated: "bewertet",
        activity: "Aktivität",
        currentWatches: "Aktuell am Schauen",
      },
      series: {
        title: "Serien",
        episodes: "Folgen",
        season: "Staffel",
        progress: "Fortschritt",
        resume: "Fortsetzen",
        noSeries: "Keine Serien in deiner Mediathek",
        episode: "Folge",
        overview: "Übersicht",
      },
      auth: {
        welcome: "Willkommen bei InFocus Family CineLog",
        subtitle: "Dein persönliches Kino-Logbuch",
        login: "Anmelden",
        signup: "Registrieren",
        email: "E-Mail Adresse",
        password: "Passwort",
        noAccount: "Noch kein Konto?",
        hasAccount: "Bereits ein Konto?",
        forgotPassword: "Passwort vergessen?",
        resetPasswordTitle: "Passwort zurücksetzen",
        sendInstructions: "Anweisungen senden",
        resetSuccess: "Anweisungen zum Zurücksetzen wurden an deine E-Mail gesendet.",
        admin: "Admin",
        manager: "Manager"
      },
      stats: {
        total: "Gesamt",
        watched: "Gesehen",
        hours: "Stunden",
        genres: "Beliebte Genres",
        timeline: "Zeitstrahl"
      },
      profile: {
        title: "Profil & Einstellungen",
        tabProfile: "Profil",
        tabSettings: "Einstellungen",
        tabData: "Daten",
        tabAppearance: "Darstellung",
        displayName: "Anzeigename",
        email: "E-Mail",
        role: "Rolle",
        save: "Änderungen speichern",
        generateAvatar: "Avatar generieren",
        removeAvatar: "Avatar entfernen",
        theme: "Design",
        themeLight: "Hell",
        themeDark: "Dunkel",
        themeGlass: "Glassmorphism",
        language: "Sprache",
        changePassword: "Passwort ändern",
        newPassword: "Neues Passwort",
        confirmPassword: "Passwort bestätigen",
        updatePassword: "Passwort aktualisieren",
        passwordMatchError: "Passwörter stimmen nicht überein.",
        passwordLengthError: "Passwort muss mindestens 6 Zeichen lang sein.",
        passwordSuccess: "Passwort erfolgreich aktualisiert!",
        export: "Watchlist exportieren",
        import: "Watchlist importieren",
        importDesc: "Liste aus einer Datei wiederherstellen. (Nur Admin)",
        exportDesc: "Lade deine Watchlist als JSON-Datei herunter.",
        clearCache: "App Cache leeren",
        version: "Version",
        adminArea: "Admin Bereich"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
