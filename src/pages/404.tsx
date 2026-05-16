import StarryBackground from "../components/StarryBackground"
import { IoTelescopeOutline } from "react-icons/io5";

function Error404Page() {
  return (
    <div className="flex items-center justify-center h-screen bg-linear-to-b from-slate-950 to-gray-900">
        <StarryBackground/> 
        <span className="flex flex-col gap-1 items-center">
            <IoTelescopeOutline strokeWidth={2} size={50}/>
            <h1 className="text-xl">Page does not exist</h1>
        </span>
    </div>
  )
}

export default Error404Page