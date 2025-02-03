import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  status?: 'success' | 'warning' | 'error'
}

export default function StatCard({ title, value, icon, description, status }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
        {status && (
          <div className={cn(
            "text-xs mt-2",
            status === 'success' && "text-green-500",
            status === 'warning' && "text-yellow-500",
            status === 'error' && "text-red-500"
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}