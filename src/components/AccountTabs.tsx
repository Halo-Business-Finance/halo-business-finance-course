import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AccountTabs = () => {
  return (
    <TabsList className="grid w-auto grid-cols-5 bg-transparent border-none p-0 h-auto gap-2">
      <TabsTrigger value="account" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
        My Account
      </TabsTrigger>
      <TabsTrigger value="notifications" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
        Notifications
      </TabsTrigger>
      <TabsTrigger value="privacy" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
        Privacy
      </TabsTrigger>
      <TabsTrigger value="preferences" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
        Preferences
      </TabsTrigger>
      <TabsTrigger value="billing" className="bg-blue-700 text-white italic text-xs rounded-t-lg rounded-b-none border border-blue-600 border-b-0 px-3 py-2">
        Billing
      </TabsTrigger>
    </TabsList>
  );
};