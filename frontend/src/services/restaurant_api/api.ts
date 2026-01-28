import { useApiQuery } from "../useApiQuery"

export const getCuisine = () => {
    return useApiQuery({
        endpoint: "/cuisine/list",
        queryKey: ["cuisine"],
    })
}
