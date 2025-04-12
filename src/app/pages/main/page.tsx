import GameButton from "@/app/pages/components/GameButton";

export default function main() {
    return (
        <>
            <div className='min-h-screen bg-cover bg-center bg-[url(/assets/background.png)] relative'>
                <div className='absolute top-1/2 right-10 transform -translate-y-1/2 space-y-1'>
                    <GameButton>SHOP</GameButton>
                    <GameButton>PROFILE</GameButton>
                    <GameButton>CHARACTER</GameButton>

                    <GameButton className='mt-10 filter hue-rotate-75'>PLAY</GameButton>
                </div>
            </div>
        </>
    )
}