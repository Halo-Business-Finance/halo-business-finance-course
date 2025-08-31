import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash,
  Eye,
  Filter,
  Download
} from "lucide-react";
import { SecurityStatusIndicator } from "@/components/SecurityStatusIndicator";
import { SecurePIIDisplay } from "@/components/SecurePIIDisplay";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Lead {
  id: string;
  created_at: string;
  updated_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  job_title?: string;
  company_size?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  lead_source?: string;
  lead_type?: string;
  status: string;
  assigned_to?: string;
  admin_notes?: string;
  follow_up_date?: string;
  last_contacted?: string;
  is_masked?: boolean;
}

const LeadsManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

const fetchLeads = async () => {
    try {
      // Use new encrypted secure leads function with enhanced PII protection
      const { data, error } = await supabase.rpc('get_secure_leads_encrypted', {
        p_limit: 500,
        p_offset: 0
      });

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Error",
          description: "Failed to load leads. " + (error.message?.includes('privileges') ? 'Admin privileges required.' : 'Please try again.'),
          variant: "destructive",
        });
        return;
      }

      // Transform the secure leads data to match Lead interface
      const transformedData = (data || []).map((lead: any) => ({
        ...lead,
        updated_at: lead.created_at,
        lead_source: 'contact_sales',
        lead_type: 'sales'
      }));
      
      setLeads(transformedData);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          last_contacted: newStatus === 'contacted' ? new Date().toISOString() : undefined
        })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead status:', error);
        toast({
          title: "Error",
          description: "Failed to update lead status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });

      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error('Error in updateLeadStatus:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ admin_notes: notes })
        .eq('id', leadId);

      if (error) {
        console.error('Error updating lead notes:', error);
        toast({
          title: "Error",
          description: "Failed to update lead notes",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Lead notes updated successfully",
      });

      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error('Error in updateLeadNotes:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">New</Badge>;
      case 'contacted':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Contacted</Badge>;
      case 'qualified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Qualified</Badge>;
      case 'closed':
        return <Badge variant="default" className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeadTypeBadge = (leadType: string) => {
    switch (leadType) {
      case 'sales':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Sales</Badge>;
      case 'demo':
        return <Badge variant="default" className="bg-orange-50 text-orange-700 border-orange-200">Demo</Badge>;
      case 'support':
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">Support</Badge>;
      default:
        return <Badge variant="outline">{leadType}</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesType = leadTypeFilter === 'all' || (lead.lead_type && lead.lead_type === leadTypeFilter);
    const matchesSearch = searchTerm === '' || 
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      'Date Created', 'Name', 'Email', 'Phone', 'Company', 'Job Title', 
      'Company Size', 'Budget', 'Timeline', 'Lead Type', 'Status', 'Message'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
        `"${lead.first_name} ${lead.last_name}"`,
        lead.email,
        lead.phone || '',
        `"${lead.company}"`,
        `"${lead.job_title || ''}"`,
        lead.company_size || '',
        lead.budget || '',
        lead.timeline || '',
        lead.lead_type || 'sales',
        lead.status,
        `"${lead.message || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads Management</h2>
          <p className="text-muted-foreground">Manage and track sales inquiries and demo requests</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lead Type</Label>
              <Select value={leadTypeFilter} onValueChange={setLeadTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setLeadTypeFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold">{leads.filter(l => l.status === 'qualified').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {leads.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              <CardDescription>
                Recent leads and their current status
              </CardDescription>
            </div>
            <SecurityStatusIndicator 
              isDataMasked={leads.length > 0 ? leads[0].is_masked : false}
              showDetails={false}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-muted-foreground">
                {leads.length === 0 
                  ? "No leads have been submitted yet." 
                  : "No leads match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">Company</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <SecurePIIDisplay 
                            value={`${lead.first_name} ${lead.last_name}`} 
                            type="name" 
                            isMasked={lead.is_masked}
                            showMaskingIndicator={false}
                          />
                          <div className="text-sm text-muted-foreground">
                            <SecurePIIDisplay 
                              value={lead.email} 
                              type="email" 
                              isMasked={lead.is_masked}
                              showMaskingIndicator={false}
                            />
                          </div>
                          {lead.phone && (
                            <div className="text-sm text-muted-foreground">
                              <SecurePIIDisplay 
                                value={lead.phone} 
                                type="phone" 
                                isMasked={lead.is_masked}
                                showMaskingIndicator={false}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{lead.company}</p>
                          {lead.job_title && (
                            <p className="text-sm text-muted-foreground">{lead.job_title}</p>
                          )}
                        </div>
                      </td>
                       <td className="p-2">
                         {getLeadTypeBadge(lead.lead_type || 'sales')}
                       </td>
                      <td className="p-2">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="p-2">
                        <p className="text-sm">
                          {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.created_at), 'HH:mm')}
                        </p>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select 
                            value={lead.status} 
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedLead.first_name} {selectedLead.last_name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company</Label>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                  {selectedLead.job_title && (
                    <div>
                      <Label>Job Title</Label>
                      <p className="font-medium">{selectedLead.job_title}</p>
                    </div>
                  )}
                  {selectedLead.company_size && (
                    <div>
                      <Label>Company Size</Label>
                      <p className="font-medium">{selectedLead.company_size}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Information */}
              {(selectedLead.budget || selectedLead.timeline) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLead.budget && (
                      <div>
                        <Label>Budget</Label>
                        <p className="font-medium">{selectedLead.budget}</p>
                      </div>
                    )}
                    {selectedLead.timeline && (
                      <div>
                        <Label>Timeline</Label>
                        <p className="font-medium">{selectedLead.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div className="space-y-2">
                  <Label>Message</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{selectedLead.message}</p>
                  </div>
                </div>
              )}

              {/* Lead Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lead Information</h3>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                     <Label>Type</Label>
                     <div className="mt-1">{getLeadTypeBadge(selectedLead.lead_type || 'sales')}</div>
                   </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                  </div>
                   <div>
                     <Label>Source</Label>
                     <p className="font-medium">{selectedLead.lead_source || 'contact_sales'}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created</Label>
                    <p className="font-medium">
                      {format(new Date(selectedLead.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                   <div>
                     <Label>Last Updated</Label>
                     <p className="font-medium">
                       {format(new Date(selectedLead.updated_at || selectedLead.created_at), 'MMM dd, yyyy HH:mm')}
                     </p>
                   </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add your notes about this lead..."
                  value={selectedLead.admin_notes || ''}
                  onChange={(e) => setSelectedLead({
                    ...selectedLead,
                    admin_notes: e.target.value
                  })}
                  rows={3}
                />
                <Button 
                  onClick={() => updateLeadNotes(selectedLead.id, selectedLead.admin_notes || '')}
                  size="sm"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManager;