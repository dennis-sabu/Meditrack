export const getStatusColor = (status: string) => {
    switch (status) {
        case "Completed":
            return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
        case "In Progress":
            return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
        case "Not Started":
            return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
        default:
            return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
}