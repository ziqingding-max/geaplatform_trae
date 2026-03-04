import { workerTrpc } from "@/lib/workerTrpc";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WorkerMilestones() {
  const { data, isLoading } = workerTrpc.milestones.list.useQuery({ page: 1, pageSize: 20 });

  return (
    <WorkerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No milestones found.
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.items.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Flag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold">{milestone.currency} {milestone.amount}</p>
                          <Badge variant={
                            milestone.status === "paid" ? "default" : 
                            milestone.status === "approved" ? "secondary" : 
                            "outline"
                          }>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </WorkerLayout>
  );
}
