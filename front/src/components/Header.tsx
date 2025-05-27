import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header () {
    return <>
        <nav className="block w-full max-w-screen-lg px-4 py-2 mx-auto bg-white bg-opacity-90 sticky top-3 shadow lg:px-8 lg:py-3 backdrop-blur-lg backdrop-saturate-150 z-[9999] mb-5 rounded-xl">
            <div className="container flex flex-wrap items-center justify-between mx-auto text-slate-800">
                <a href="/"
                className="mr-4 block cursor-pointer py-1.5 text-base text-slate-800 font-semibold">
                    FOMO
                </a>
                <ConnectButton />
            </div>
        </nav>
    </>
}