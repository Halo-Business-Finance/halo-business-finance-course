import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, Menu, Link, ExternalLink } from "lucide-react";

interface CMSMenu {
  id: string;
  name: string;
  label: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CMSMenuItem {
  id: string;
  menu_id: string;
  parent_id?: string;
  title: string;
  url?: string;
  page_id?: string;
  target: '_self' | '_blank';
  icon?: string;
  sort_order: number;
  css_class?: string;
  is_active: boolean;
}

export const CMSMenuManager = () => {
  const [menus, setMenus] = useState<CMSMenu[]>([]);
  const [menuItems, setMenuItems] = useState<CMSMenuItem[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CMSMenu | null>(null);
  const [editingItem, setEditingItem] = useState<CMSMenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [menuFormData, setMenuFormData] = useState({
    name: '',
    label: '',
    location: '',
    is_active: true
  });

  const [itemFormData, setItemFormData] = useState<{
    title: string;
    url: string;
    page_id: string;
    parent_id: string;
    target: '_self' | '_blank';
    icon: string;
    sort_order: number;
    css_class: string;
    is_active: boolean;
  }>({
    title: '',
    url: '',
    page_id: '',
    parent_id: '',
    target: '_self',
    icon: '',
    sort_order: 0,
    css_class: '',
    is_active: true
  });

  useEffect(() => {
    fetchMenus();
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      fetchMenuItems(selectedMenu);
    }
  }, [selectedMenu]);

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_menus')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMenus(data || []);
      if (data && data.length > 0 && !selectedMenu) {
        setSelectedMenu(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menus",
        variant: "destructive"
      });
    }
  };

  const fetchMenuItems = async (menuId: string) => {
    try {
      const { data, error } = await supabase
        .from('cms_menu_items')
        .select('*')
        .eq('menu_id', menuId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMenuItems((data || []) as CMSMenuItem[]);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive"
      });
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id, title, slug')
        .eq('status', 'published')
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      label: '',
      location: '',
      is_active: true
    });
    setEditingMenu(null);
  };

  const resetItemForm = () => {
    setItemFormData({
      title: '',
      url: '',
      page_id: '',
      parent_id: '',
      target: '_self',
      icon: '',
      sort_order: 0,
      css_class: '',
      is_active: true
    });
    setEditingItem(null);
  };

  const handleEditMenu = (menu: CMSMenu) => {
    setEditingMenu(menu);
    setMenuFormData({
      name: menu.name,
      label: menu.label,
      location: menu.location || '',
      is_active: menu.is_active
    });
    setIsMenuDialogOpen(true);
  };

  const handleEditItem = (item: CMSMenuItem) => {
    setEditingItem(item);
    setItemFormData({
      title: item.title,
      url: item.url || '',
      page_id: item.page_id || '',
      parent_id: item.parent_id || '',
      target: item.target,
      icon: item.icon || '',
      sort_order: item.sort_order,
      css_class: item.css_class || '',
      is_active: item.is_active
    });
    setIsItemDialogOpen(true);
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormData.name.trim()) return;

    setLoading(true);
    try {
      const menuData = {
        name: menuFormData.name.trim(),
        label: menuFormData.label.trim(),
        location: menuFormData.location.trim() || null,
        is_active: menuFormData.is_active
      };

      if (editingMenu) {
        const { error } = await supabase
          .from('cms_menus')
          .update(menuData)
          .eq('id', editingMenu.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('cms_menus')
          .insert([menuData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu created successfully"
        });
      }

      await fetchMenus();
      setIsMenuDialogOpen(false);
      resetMenuForm();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast({
        title: "Error",
        description: "Failed to save menu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.title.trim()) return;

    setLoading(true);
    try {
      const itemData = {
        menu_id: selectedMenu,
        title: itemFormData.title.trim(),
        url: itemFormData.url.trim() || null,
        page_id: itemFormData.page_id || null,
        parent_id: itemFormData.parent_id || null,
        target: itemFormData.target,
        icon: itemFormData.icon.trim() || null,
        sort_order: itemFormData.sort_order,
        css_class: itemFormData.css_class.trim() || null,
        is_active: itemFormData.is_active
      };

      if (editingItem) {
        const { error } = await supabase
          .from('cms_menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu item updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('cms_menu_items')
          .insert([itemData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Menu item created successfully"
        });
      }

      await fetchMenuItems(selectedMenu);
      setIsItemDialogOpen(false);
      resetItemForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (menu: CMSMenu) => {
    if (!confirm('Are you sure you want to delete this menu? All menu items will also be deleted.')) return;

    try {
      const { error } = await supabase
        .from('cms_menus')
        .delete()
        .eq('id', menu.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Menu deleted successfully"
      });
      
      await fetchMenus();
      if (selectedMenu === menu.id) {
        setSelectedMenu(menus.length > 1 ? menus.find(m => m.id !== menu.id)?.id || '' : '');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (item: CMSMenuItem) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const { error } = await supabase
        .from('cms_menu_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
      
      await fetchMenuItems(selectedMenu);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const getParentItems = () => {
    return menuItems.filter(item => !item.parent_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Navigation Menus</h3>
          <p className="text-sm text-muted-foreground">Create and manage website navigation menus and menu items</p>
        </div>
        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetMenuForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? 'Edit Menu' : 'Create New Menu'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div>
                <Label htmlFor="menu-name">Name</Label>
                <Input
                  id="menu-name"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="menu-label">Label</Label>
                <Input
                  id="menu-label"
                  value={menuFormData.label}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, label: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="menu-location">Location</Label>
                <Input
                  id="menu-location"
                  value={menuFormData.location}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="header, footer, sidebar, etc."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="menu-active"
                  checked={menuFormData.is_active}
                  onCheckedChange={(checked) => setMenuFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="menu-active">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Menu'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Menus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                    selectedMenu === menu.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedMenu(menu.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{menu.label}</div>
                      <div className="text-xs text-muted-foreground">{menu.location}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {menu.is_active ? (
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditMenu(menu); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Menu Items</CardTitle>
              {selectedMenu && (
                <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={resetItemForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleItemSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="item-title">Title</Label>
                        <Input
                          id="item-title"
                          value={itemFormData.title}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="item-page">Link to Page</Label>
                        <Select
                          value={itemFormData.page_id}
                          onValueChange={(value) => setItemFormData(prev => ({ ...prev, page_id: value, url: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a page (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Custom URL</SelectItem>
                            {pages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {!itemFormData.page_id && (
                        <div>
                          <Label htmlFor="item-url">Custom URL</Label>
                          <Input
                            id="item-url"
                            value={itemFormData.url}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://example.com or /path"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="item-parent">Parent Item</Label>
                        <Select
                          value={itemFormData.parent_id}
                          onValueChange={(value) => setItemFormData(prev => ({ ...prev, parent_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No parent (top level)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Parent</SelectItem>
                            {getParentItems().map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="item-target">Target</Label>
                          <Select
                            value={itemFormData.target}
                            onValueChange={(value: '_self' | '_blank') => setItemFormData(prev => ({ ...prev, target: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_self">Same window</SelectItem>
                              <SelectItem value="_blank">New window</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="item-sort">Sort Order</Label>
                          <Input
                            id="item-sort"
                            type="number"
                            value={itemFormData.sort_order}
                            onChange={(e) => setItemFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="item-icon">Icon (CSS class)</Label>
                        <Input
                          id="item-icon"
                          value={itemFormData.icon}
                          onChange={(e) => setItemFormData(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="lucide-home, fa-home, etc."
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="item-active"
                          checked={itemFormData.is_active}
                          onCheckedChange={(checked) => setItemFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="item-active">Active</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : 'Save Item'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedMenu ? (
              <div className="text-center py-8 text-muted-foreground">
                <Menu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a menu to manage its items</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No menu items created yet</p>
                <p className="text-sm">Add your first menu item to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getParentItems().map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.icon && <span className="text-xs">{item.icon}</span>}
                            <span className="font-medium">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {item.page_id ? (
                              <Link className="h-3 w-3" />
                            ) : (
                              <ExternalLink className="h-3 w-3" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {item.page_id ? pages.find(p => p.id === item.page_id)?.title : item.url}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{item.sort_order}</TableCell>
                        <TableCell>
                          {item.is_active ? (
                            <Badge variant="outline" className="text-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {menuItems.filter(child => child.parent_id === item.id).map((childItem) => (
                        <TableRow key={childItem.id} className="bg-muted/30">
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-2">
                              {childItem.icon && <span className="text-xs">{childItem.icon}</span>}
                              <span>{childItem.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {childItem.page_id ? (
                                <Link className="h-3 w-3" />
                              ) : (
                                <ExternalLink className="h-3 w-3" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {childItem.page_id ? pages.find(p => p.id === childItem.page_id)?.title : childItem.url}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>{childItem.sort_order}</TableCell>
                          <TableCell>
                            {childItem.is_active ? (
                              <Badge variant="outline" className="text-green-600">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditItem(childItem)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteItem(childItem)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};