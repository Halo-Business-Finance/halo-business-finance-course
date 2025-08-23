import { Button } from "@/components/ui/button";

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AccountTabs = ({ activeTab, onTabChange }: AccountTabsProps) => {
  const tabs = [
    { value: "account", label: "My Account" },
    { value: "notifications", label: "Notifications" },
    { value: "privacy", label: "Privacy" },
    { value: "preferences", label: "Preferences" },
    { value: "support", label: "Support" },
    { value: "billing", label: "Billing" }
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange(tab.value)}
          className={`bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2 hover:bg-blue-600 ${
            activeTab === tab.value ? 'bg-blue-800' : ''
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};