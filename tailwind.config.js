/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'sky-body': '#edf2f8',
                'deep-blue': '#313bac',
                'slate-muted': '#6b7688',
                'ink-black': '#030303',
            },
            fontFamily: {
                sans: ['"DM Sans"', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
            },
            boxShadow: {
                'surface': '0 10px 32px rgba(33, 50, 112, 0.08)',
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '18px',
            }
        },
    },
    plugins: [],
}
