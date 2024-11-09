"use client";

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";

const QrCodeScanner = () => {
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [ingredientInfo, setIngredientInfo] = useState<{ ingredientId: string, quantity: number, category: string, grower: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    newScanner.render(
      async (decodedText, decodedResult) => {
        // Process the decoded result (for example, fetch item details)
        console.log("Decoded text: ", decodedText);
        setDecodedText(decodedText);

        // Parse the URL to extract query parameters
        const url = new URL(decodedText);
        const ingredientId = decodeURIComponent(url.pathname.split('/').pop() || '');
        const quantity = parseInt(url.searchParams.get('quantity') || '0', 10);
        const category = decodeURIComponent(url.searchParams.get('category') || '');
        const grower = decodeURIComponent(url.searchParams.get('grower') || '');

        try {
          const response = await fetch(`/api/ingredients/${ingredientId}`);
          const data = await response.json();
          setIngredientInfo({ 
            ingredientId: data.name, 
            quantity, 
            category: data.category, 
            grower: data.grower 
          });
        } catch (error) {
          console.error('Error fetching ingredient info:', error);
        }
        
        setIsModalOpen(true); // Open the modal when QR code is scanned
      },
      (error) => {
        console.warn(`QR Code no match: ${error}`);
      }
    );

    setScanner(newScanner);

    return () => {
      newScanner.clear().catch(error => console.error("Failed to clear scanner: ", error));
    };
  }, []);

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().then(() => {
        console.log("Scanner stopped.");
      }).catch(error => console.error("Failed to stop scanner: ", error));
    }
  };

  const reinitializeScanner = () => {
    if (scanner) {
      scanner.clear().then(() => {
        const newScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: 250 },
          false
        );

        newScanner.render(
          (decodedText, decodedResult) => {
            // Process the decoded result (for example, fetch item details)
            console.log("Decoded text: ", decodedText);
            setDecodedText(decodedText);

            // Parse the URL to extract query parameters
            const url = new URL(decodedText);
            const ingredientId = url.pathname.split('/').pop();
            const quantity = parseInt(url.searchParams.get('quantity') || '0', 10);
            const category = url.searchParams.get('category') || '';
            const grower = url.searchParams.get('grower') || '';

            setIngredientInfo({ 
              ingredientId: ingredientId || '', 
              quantity, 
              category: category || '', 
              grower: grower || '' 
            });
            setIsModalOpen(true); // Open the modal when QR code is scanned
          },
          (error) => {
            console.warn(`QR Code no match: ${error}`);
          }
        );

        setScanner(newScanner);
      }).catch(error => console.error("Failed to reinitialize scanner: ", error));
    }
  };

  return (
    <div>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Scanner</p>
            <p className="text-muted-foreground">
              Scan the QR code to view the ingredient information
            </p>
          </div>
        </div>
      </div>
      <div className="container flex flex-col items-center gap-4 p-4">
        <div id="qr-reader" style={{ width: "500px", marginTop: "20px" }}></div>
        <div className="flex gap-2">
          <Button onClick={stopScanning}>Stop Scanning</Button>
          <Button onClick={reinitializeScanner}>Reinitialize Scanner</Button>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant={"ghost"} className="hidden">Open Modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingredient </DialogTitle>
            <DialogDescription> ingredient</DialogDescription>
          </DialogHeader>
          {ingredientInfo && (
            <div className="space-y-4">
              <p><strong>Ingredient Name:</strong> {decodeURIComponent(ingredientInfo.ingredientId)}</p>
              <p><strong>Quantity:</strong> {ingredientInfo.quantity}</p>
              <p><strong>Category:</strong> {decodeURIComponent(ingredientInfo.category)}</p>
              <p><strong>Grower:</strong> {decodeURIComponent(ingredientInfo.grower)}</p>
              <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                  >
                  New Order
                </Button>
              }
              type="order"
            />
                        <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                  >
                  New Return
                </Button>
              }
              type="returns"
            />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QrCodeScanner;