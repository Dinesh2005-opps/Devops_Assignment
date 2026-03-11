import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useNeeds, useCreateNeed, useUpdateNeedStatus } from "@/hooks/use-needs";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, CheckCircle, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrphanageDashboard() {
  const { user } = useAuth();
  const { data: needs = [], isLoading } = useNeeds();
  const { mutateAsync: createNeed, isPending: isCreating } = useCreateNeed();
  const { mutateAsync: updateStatus } = useUpdateNeedStatus();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "", quantity: 1, description: "", urgency: "Medium"
  });

  // Filter needs that belong to this orphanage
  const myNeeds = needs.filter((n: any) => n.orphanageId === user?.id) || [];
  
  const pendingCount = myNeeds.filter((n: any) => n.status === "Pending").length;
  const fulfilledCount = myNeeds.filter((n: any) => n.status === "Fulfilled").length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNeed({
        ...formData,
        quantity: Number(formData.quantity)
      });
      toast({ title: "Need posted successfully!" });
      setIsModalOpen(false);
      setFormData({ item: "", quantity: 1, description: "", urgency: "Medium" });
    } catch (error: any) {
      toast({ title: "Failed to post need", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkFulfilled = async (id: number) => {
    try {
      await updateStatus({ id, status: "Fulfilled" });
      toast({ title: "Status updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "destructive";
      case "High": return "warning";
      case "Low": return "success";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Manage Needs</h1>
            <p className="text-muted-foreground mt-1">Keep your requirements up to date for donors.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-primary/30">
            <Plus size={20} /> Post a Need
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Needs</p>
                <p className="text-4xl font-display font-bold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-green-50/50">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fulfilled</p>
                <p className="text-4xl font-display font-bold">{fulfilledCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Needs List */}
        <h2 className="text-xl font-bold mb-6">Your Posted Needs</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : myNeeds.length === 0 ? (
          <div className="text-center py-20 bg-white/50 border border-border/50 rounded-3xl border-dashed">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No needs posted yet</h3>
            <p className="text-muted-foreground mb-6">Let donors know what you currently require.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create your first post</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNeeds.map((need: any) => (
              <Card key={need.id} className="flex flex-col h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getUrgencyColor(need.urgency) as any}>{need.urgency} Urgency</Badge>
                    <Badge variant={need.status === "Fulfilled" ? "success" : "outline"}>
                      {need.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{need.item}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-3xl font-bold text-primary mb-2">{need.quantity} <span className="text-sm text-muted-foreground font-normal">requested</span></p>
                  <p className="text-muted-foreground line-clamp-3 text-sm">{need.description}</p>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 bg-gray-50/50">
                  {need.status === "Pending" ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleMarkFulfilled(need.id)}
                    >
                      <CheckCircle size={16} className="mr-2" /> Mark as Fulfilled
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className="w-full opacity-50">
                      Fulfilled
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a New Need">
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <Input 
            label="Item Name" 
            required placeholder="e.g. Winter Blankets, Textbooks"
            value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Quantity" 
              type="number" min="1" required
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
            />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 block">Urgency</label>
              <select 
                className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 block">Description</label>
            <textarea 
              required
              className="w-full min-h-[100px] rounded-xl border-2 border-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 resize-none"
              placeholder="Why do you need this? Who will it help?"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isCreating}>
            Publish Need
          </Button>
        </form>
      </Modal>
    </div>
  );
}
