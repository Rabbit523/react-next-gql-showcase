export interface DarkmodeState {
  userDarkMode: boolean | null // the user's choice for dark mode or light mode
  matchesDarkMode: boolean // whether the dark mode media query matches
}

export const DarkmodeInitialState = {
  userDarkMode: null,
  matchesDarkMode: false,
}
