/**
 * Barrel file con lazy loading para todas las páginas
 * Cada página se carga en su propio chunk para optimizar el bundle inicial
 */
import { lazy } from "react";

// Páginas principales
export const Home = lazy(() => import("./Home"));
export const NewsList = lazy(() => import("./NewsList"));
export const NewsDetail = lazy(() => import("./NewsDetail"));
export const Players = lazy(() => import("./Players"));
export const PlayerDetail = lazy(() => import("./PlayerDetail"));

// Páginas de funcionalidades
export const Category = lazy(() => import("./Category"));
export const Leaderboards = lazy(() => import("./Leaderboards"));
export const Transfers = lazy(() => import("./Transfers"));
export const Search = lazy(() => import("./Search"));
export const Favorites = lazy(() => import("./Favorites"));

// Páginas de usuario
export const Profile = lazy(() => import("./Profile"));

// Páginas informativas
export const About = lazy(() => import("./About"));
export const Support = lazy(() => import("./Support"));
export const Terms = lazy(() => import("./Terms"));
export const Privacy = lazy(() => import("./Privacy"));
export const Disclaimer = lazy(() => import("./Disclaimer"));
export const Contact = lazy(() => import("./Contact"));

// Páginas de sistema
export const NotFound = lazy(() => import("./NotFound"));

// Páginas de desarrollo (solo dev)
export const ComponentShowcase = lazy(() => import("./ComponentShowcase"));
