# Inventory Batch Selection & Sale/Waste Flow

## Summary of Updates

1. **Inventory Table Modal for Batch Selection**
   - Clicking a product row in the inventory table opens a modal displaying all available 'add' transaction batches for that product (with date, original qty, remaining qty, cost/unit).
   - Each batch row includes a 'Select for sale/waste' button. Selected batches are tracked in state.
   - When one or more batches are selected, a 'Proceed to Sale/Waste' button appears.

2. **Batch-Aware CreateTransactionDialog**
   - Clicking 'Proceed to Sale/Waste' opens a single CreateTransactionDialog, prepopulated with all selected batches.
   - The dialog displays a table of selected batches, allowing the user to review and adjust the quantity to remove from each batch (defaulting to the full remaining quantity).
   - On submit, the batch breakdown is logged (ready to be sent to the backend for processing).

3. **Linter and Type Fixes**
   - Fixed category/unit access in filter options to use `categoryName` and `unitName`.
   - Provided a dummy trigger to CreateTransactionDialog to satisfy required props.
   - Removed references to undefined components.

## Next Steps

1. **Backend Integration**
   - Implement a backend endpoint/action to process batch sale/waste transactions, consuming the specified quantities from each batch.
   - Update the CreateTransactionDialog to call this endpoint with the batch breakdown on submit.

2. **User Experience Enhancements**
   - Allow the user to choose between 'sold' and 'waste' transaction types in the dialog.
   - Provide feedback and error handling for partial/invalid batch removals.
   - Optionally, allow deselecting batches or clearing the selection.

3. **Testing & Validation**
   - Test the full flow with various batch and quantity scenarios.
   - Ensure inventory and batch quantities are updated correctly after each transaction.

---

**You can now select batches for sale/waste directly from the inventory table and process them in a single, user-friendly dialog!** 