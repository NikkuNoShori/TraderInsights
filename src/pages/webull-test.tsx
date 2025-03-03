import { WebullTest } from "@/components/webull/WebullTest";

export default function WebullTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Webull API Test</h1>
      <WebullTest />
    </div>
  );
}
