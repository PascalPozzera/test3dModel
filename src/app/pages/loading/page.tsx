export default function loading() {
    return (
        <>
            <div className='min-h-screen bg-cover bg-center bg-[url(/assets/background_3.png)] relative'>
                <img src='/assets/logo_cropped.png' alt='Logo' className='w-110 '/>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[300px] h-6 bg-black rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full animate-slide"></div>
                </div>
            </div>
        </>
    )
}