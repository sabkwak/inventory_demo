import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCreateTransactionDialog from "@/app/(dashboard)/scanner/components/QRCreateTransactionDialog";
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";

const QrCodeScanner = () => {
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [strainInfo, setStrainInfo] = useState<{ strainId: string, quantity: number, category: string, grower: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        const strainId = decodeURIComponent(url.pathname.split('/').pop() || '');
        const quantity = parseInt(url.searchParams.get('quantity') || '0', 10);
        const category = decodeURIComponent(url.searchParams.get('category') || '');
        const grower = decodeURIComponent(url.searchParams.get('grower') || '');

        setStrainInfo({ strainId, quantity, category, grower });
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
            <DialogTitle>Strain Information</DialogTitle>
            <DialogDescription> strain</DialogDescription>
          </DialogHeader>
          {strainInfo && (
            <div className="space-y-4">
              <p><strong>Strain ID:</strong> {strainInfo.strainId}</p>
              <p><strong>Quantity:</strong> {strainInfo.quantity}</p>
              <p><strong>Category:</strong> {strainInfo.category}</p>
              <p><strong>Grower:</strong> {strainInfo.grower}</p>
              <div>
              <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                  >
                  New Order
                </Button>
              }
              type="returns"
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