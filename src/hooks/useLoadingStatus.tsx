import { useState } from "react"

const useLoadingStatus = () => {
    [loading, setLoading] = useState(true);

    return (
    <div>useLoadingStatus</div>
  )
}

export default useLoadingStatus