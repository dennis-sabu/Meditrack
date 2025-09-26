import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function ReactTheme(props: { children: React.ReactNode, mode: "light" | "dark" }) {
    return <ThemeProvider
        attribute={'class'}
        disableTransitionOnChange
        defaultTheme={props.mode}
        forcedTheme={props.mode}
        enableColorScheme
        enableSystem={false}
    >
        {props.children}
        <svg className="hidden">
            <filter
                id="grainy"
             >
                <feTurbulence
                    type="turbulence"
                    baseFrequency="0.5"
                />
                <feComposite
                    operator={'in'}
                    in2={"SourceGraphic"}
                    result="monoNoise" />
            </filter>
        </svg>
    </ThemeProvider>
}