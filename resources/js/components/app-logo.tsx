import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500 text-black">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <span className="ml-2 truncate text-base font-bold tracking-tight text-white">
                Venu
            </span>
        </>
    );
}
