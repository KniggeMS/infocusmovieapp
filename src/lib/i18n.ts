import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        loading: "Loading...",
        search: "Search...",
        noResults: "No movies found",
        beginSearch: "Search for a title to begin.",
        signout: "Sign Out",
        back: "Back",
        plot: "Synopsis",
        director: "Director",
        cast: "Top Cast",
        providers: "Where to Watch",
        recommendations: "You might also like",
        inLibrary: "In Library",
        addToWatchlist: "Add to Watchlist",
        playTrailer: "Play Trailer",
        released: "Released",
        upcoming: "Upcoming",
        match: "Match"
      },
      nav: {
        home: "Home",
        favorites: "Favorites",
        watched: "Watched",
        achievements: "Achievements",
        statistics: "Statistics"
      },
      auth: {
        welcome: "Welcome to InFocus",
        subtitle: "Your personal cinema logbook",
        login: "Sign In",
        signup: "Sign Up",
        email: "Email Address",
        password: "Password",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        admin: "Admin",
        manager: "Manager"
      },
      stats: {
        total: "Total",
        watched: "Watched",
        hours: "Hours",
        genres: "Favorite Genres",
        timeline: "Timeline"
      }
    }
  },
  de: {
    translation: {
      common: {
        loading: "Lädt...",
        search: "Suchen...",
        noResults: "Keine Filme gefunden",
        beginSearch: "Suche nach einem Titel, um zu starten.",
        signout: "Abmelden",
        back: "Zurück",
        plot: "Handlung",
        director: "Regie",
        cast: "Besetzung",
        providers: "Wo zu sehen",
        recommendations: "Das könnte dir auch gefallen",
        inLibrary: "In der Mediathek",
        addToWatchlist: "Auf die Watchlist",
        playTrailer: "Trailer abspielen",
        released: "Veröffentlicht",
        upcoming: "Demnächst",
        match: "Übereinstimmung"
      },
      nav: {
        home: "Start",
        favorites: "Favoriten",
        watched: "Gesehen",
        achievements: "Erfolge",
        statistics: "Statistiken"
      },
      auth: {
        welcome: "Willkommen bei InFocus",
        subtitle: "Dein persönliches Kino-Logbuch",
        login: "Anmelden",
        signup: "Registrieren",
        email: "E-Mail Adresse",
        password: "Passwort",
        noAccount: "Noch kein Konto?",
        hasAccount: "Bereits ein Konto?",
        admin: "Admin",
        manager: "Manager"
      },
      stats: {
        total: "Gesamt",
        watched: "Gesehen",
        hours: "Stunden",
        genres: "Beliebte Genres",
        timeline: "Zeitstrahl"
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
