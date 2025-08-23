import { Button } from "@/components/ui/button";
import { MessageCircle, User, Bell, Shield, Settings, CreditCard } from "lucide-react";

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AccountTabs = ({ activeTab, onTabChange }: AccountTabsProps) => {
  const tabs = [
    { value: "account", label: "My Account", icon: User },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "privacy", label: "Privacy", icon: Shield },
    { value: "preferences", label: "Preferences", icon: Settings },
    { value: "support", label: "Support", icon: MessageCircle },
    { value: "billing", label: "Billing", icon: CreditCard }
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange(tab.value)}
          className={`bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2 hover:bg-blue-600 w-24 flex items-center justify-center gap-1 ${
            activeTab === tab.value ? 'bg-blue-800' : ''
          }`}
        >
          <tab.icon className="h-3 w-3" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};