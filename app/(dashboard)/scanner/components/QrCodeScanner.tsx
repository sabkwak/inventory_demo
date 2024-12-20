import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCreateTransactionDialog from "@/app/(dashboard)/scanner/components/QRCreateTransactionDialog";
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import { useQuery } from "@tanstack/react-query";

const QrCodeScanner = () => {
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [ingredientInfo, setIngredientInfo] = useState<{ ingredientId: string, quantity: number, category: string, brand: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products/user`).then((res) => res.json()),
  });
  const user = userQuery.data;
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText, decodedResult) => {
        // Process the decoded result (for example, fetch item details)
        console.log("Decoded text: ", decodedText);
        setDecodedText(decodedText);

        // Parse the URL to extract query parameters
        const url = new URL(decodedText);
        const ingredientId = decodeURIComponent(url.pathname.split('/').pop() || '');
        const quantity = parseInt(url.searchParams.get('quantity') || '0', 10);
        const category = decodeURIComponent(url.searchParams.get('category') || '');
        const brand = decodeURIComponent(url.searchParams.get('brand') || '');

        setIngredientInfo({ ingredientId, quantity, category, brand });
        setIsModalOpen(true); // Open the modal when QR code is scanned
      },
      (error) => {
        console.warn(`QR Code no match: ${error}`);
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner: ", error));
    };
  }, []);

  return (
    <div>
      <h1>QR Code Scanner</h1>
      <div id="qr-reader" style={{ width: "500px" }}></div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant={"ghost"} className="hidden">Open Modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingredient Information</DialogTitle>
            <DialogDescription> ingredient</DialogDescription>
          </DialogHeader>
          {ingredientInfo && (
            <div className="space-y-4">
              <p><strong>Ingredient ID:</strong> {ingredientInfo.ingredientId}</p>
              <p><strong>Quantity:</strong> {ingredientInfo.quantity}</p>
              <p><strong>Category:</strong> {ingredientInfo.category}</p>
              <p><strong>Brand:</strong> {ingredientInfo.brand}</p>
              <div>
              <CreateTransactionDialog userSettings={user}
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                  >
                  Add Ingredient
                </Button>
              }
              type="add"
            />
            </div>
            </div>
          )}
        </DialogContent>
        
      </Dialog>
<div>

</div>
    </div>
  );
};

export default QrCodeScanner;