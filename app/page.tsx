import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ManualTransactionForm from "@/components/manual-transaction-form"
import BulkUploadForm from "@/components/bulk-upload-form"
import RegisterPage from "./register/page"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      {/* <h1 className="text-3xl font-bold mb-6">Fraud Detection System</h1>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="manual">Manual Transaction Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <ManualTransactionForm />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkUploadForm />
        </TabsContent>
      </Tabs> */}
      <RegisterPage />
    </div>
  )
}

