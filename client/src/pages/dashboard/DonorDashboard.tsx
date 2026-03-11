import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useNeeds } from "@/hooks/use-needs";
import { useCreateDonation } from "@/hooks/use-donations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Search, MapPin, HeartHandshake, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DonorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { data: needs = [], isLoading } = useNeeds({ search: searchTerm, location: locationFilter });
  const { mutateAsync: createDonation, isPending: isDonating } = useCreateDonation();
  const { toast } = useToast();

  const [selectedNeed, setSelectedNeed] = useState<any>(null);
  const [donationType, setDonationType] = useState<"Item" | "Money">("Item");
  const [donationData, setDonationData] = useState({ quantity: 1, amount: "", message: "" });

  // Only show pending needs to donors
  const activeNeeds = needs.filter((n: any) => n.status === "Pending");

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNeed) return;

    try {
      await createDonation({
        needId: selectedNeed.id,
        orphanageId: selectedNeed.orphanageId,
        type: donationType,
        quantity: donationType === "Item" ? Number(donationData.quantity) : undefined,
        amount: donationType === "Money" ? donationData.amount : undefined,
        message: donationData.message
      });
      toast({ title: "Donation pledged successfully!", description: "The orphanage will be notified." });
      setSelectedNeed(null);
      setDonationData({ quantity: 1, amount: "", message: "" });
    } catch (error: any) {
      toast({ title: "Failed to process donation", description: error.message, variant: "destructive" });
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
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-display font-bold mb-4">Discover Needs</h1>
          <p className="text-muted-foreground text-lg text-balance">
            Find local orphanages and see exactly what they require. Your direct donations change lives immediately.
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-10 sticky top-24 z-30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search items (e.g. books, clothes)..."
              className="w-full bg-white rounded-xl border border-border/50 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Filter by city/location"
              className="w-full bg-white rounded-xl border border-border/50 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Needs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : activeNeeds.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-2xl font-bold mb-2">No needs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or location filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeNeeds.map((need: any) => (
              <Card key={need.id} className="flex flex-col h-full hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={getUrgencyColor(need.urgency) as any} className="uppercase tracking-wider text-[10px]">
                      {need.urgency} Priority
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-1">{need.item}</CardTitle>
                  <p className="text-sm font-semibold text-primary flex items-center gap-1">
                    {need.orphanage?.name || "Unknown Orphanage"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {need.orphanage?.location || "Location not provided"}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <span className="text-sm text-muted-foreground block mb-1">Quantity Needed</span>
                    <span className="text-2xl font-bold font-display">{need.quantity}</span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-3">{need.description}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="primary" 
                    className="w-full group"
                    onClick={() => setSelectedNeed(need)}
                  >
                    Donate Now <HeartHandshake size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Donation Modal */}
      <Modal isOpen={!!selectedNeed} onClose={() => setSelectedNeed(null)} title="Make a Donation">
        {selectedNeed && (
          <form onSubmit={handleDonateSubmit} className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h4 className="font-bold text-primary mb-1">You are supporting:</h4>
              <p className="font-semibold">{selectedNeed.orphanage?.name}</p>
              <p className="text-sm text-muted-foreground">Request: {selectedNeed.quantity}x {selectedNeed.item}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 block">How would you like to help?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDonationType("Item")}
                  className={`flex-1 py-3 border-2 rounded-xl font-medium transition-colors ${donationType === "Item" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
                >
                  Send Item
                </button>
                <button
                  type="button"
                  onClick={() => setDonationType("Money")}
                  className={`flex-1 py-3 border-2 rounded-xl font-medium transition-colors ${donationType === "Money" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
                >
                  Send Funds
                </button>
              </div>
            </div>

            {donationType === "Item" ? (
              <Input 
                label={`Quantity of ${selectedNeed.item} to pledge`}
                type="number" min="1" max={selectedNeed.quantity} required
                value={donationData.quantity} onChange={e => setDonationData({...donationData, quantity: parseInt(e.target.value)})}
              />
            ) : (
              <Input 
                label="Amount (USD)"
                type="number" min="1" step="0.01" required
                placeholder="50.00"
                value={donationData.amount} onChange={e => setDonationData({...donationData, amount: e.target.value})}
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 block">Message to Orphanage (Optional)</label>
              <textarea 
                className="w-full min-h-[80px] rounded-xl border-2 border-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 resize-none"
                placeholder="A kind word goes a long way..."
                value={donationData.message} onChange={e => setDonationData({...donationData, message: e.target.value})}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isDonating}>
              Confirm Donation
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By confirming, you commit to fulfilling this request. The orphanage will contact you to arrange delivery.
            </p>
          </form>
        )}
      </Modal>
    </div>
  );
}
