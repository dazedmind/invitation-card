export default function MessageCard({ onSend }: { onSend: () => void }) {
    return (
        <div className="text-start p-6 flex flex-col gap-2 rounded-lg shadow-md bg-slate-900 backdrop-blur-sm border border-gray-800">
            <textarea name="" id="" placeholder="Write a message..."></textarea>
            <button className="w-full rounded-full bg-blue-500 text-white p-2 cursor-pointer">
                {onSend ? 'Send' : 'Save Draft'}
            </button>
        </div>
    )
}