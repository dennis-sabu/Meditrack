import { toast } from "sonner";

export const copyTextToClipboard = async (text: string) => {
    if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(text);
        toast.custom((mainId) => (
            <div className="flex items-center gap-2 p-4 bg-zinc-800 text-white rounded-lg shadow-md" >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3>{text} copied to Clipboard</h3>
            </div>), {
            position: 'bottom-center',
            dismissible: true,
            richColors: true,
        });
    } else {
        return document.execCommand('copy', true, text);
    }
}
export const CustomToast = (message: string, type: 'success' | 'error' | 'info' | 'warning', description?: string) => {
    toast.custom((mainId) => (
        <div
            className={`flex items-start gap-4 min-w-[320px] max-w-sm w-full p-4 rounded-lg shadow-md text-white 
    ${type === 'success' ? 'bg-green-600' :
                    type === 'error' ? 'bg-red-600' :
                        type === 'info' ? 'bg-blue-600' :
                            'bg-yellow-600'}`}
        >
            <div className="pt-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                            type === 'success'
                                ? 'M5 13l4 4L19 7'
                                : type === 'error'
                                    ? 'M6 18L18 6M6 6l12 12'
                                    : type === 'info'
                                        ? 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        : 'M12 9v2m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z'
                        }
                    />
                </svg>
            </div>
            <div className="flex flex-col">
                <h3 className="font-semibold text-base leading-tight">{message}</h3>
                {description && (
                    <p className="text-sm text-white/90 leading-snug mt-1">{description}</p>
                )}
            </div>
        </div>
    ), {
        position: 'bottom-center',
        dismissible: true,
        className: 'bg-transparent',
        richColors: true,
    });
}