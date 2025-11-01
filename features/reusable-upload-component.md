# Reusable Upload Component

status: done
id: reusable-upload-component
updated_at: 2025-11-01T00:00:00.000Z
agent: codex
target: tasty-banana-admin

## 1. Summary
- Create a reusable file upload component.
- This component will be used to upload images and other files.
- It should integrate with Ant Design's forms.
- The first use case will be for the `previewUrl` in the Prompt Template management page.

## 2. Pages / Routes
- This is a component, not a page. It will be used in `/prompt-templates`.

## 3. UI Blocks
- [ ] Create a new component `src/components/forms/ImageUpload.tsx`.
- [ ] The component should use Ant Design's `Upload` component.
- [ ] It should display the uploaded image as a thumbnail.
- [ ] It should have a "Remove" button to clear the value.
- [ ] When used within a Form, it should handle `value` and `onChange` props to be compatible with Ant Design's `Form.Item`. The `value` will be the image URL.

## 4. Data Contract
### 4.1 Upload Endpoint
- METHOD: POST
- URL: /api/uploads
- Body: `multipart/form-data` with a single field `file`.
- Response:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "publicUrl": "string"
    }
  }
  ```

## 5. Permissions
- required_roles: ["admin"] (already handled by the upload route middleware).

## 6. Notes for Codex
- Create the new component at `src/components/forms/ImageUpload.tsx`.
- The component should be self-contained and reusable.
- It should handle the API call to `POST /api/uploads`.
- You will need to update the `axios` instance or create a new one to handle `multipart/form-data`.
- After creating the component, update `src/features/prompts/pages/PromptTemplatesPage.tsx`.
- In `PromptTemplatesPage.tsx`, replace the `Input` for `previewUrl` with the new `ImageUpload` component.
- The `ImageUpload` component should be placed inside the `Form.Item` for `previewUrl`.

## 7. Execution Log
- 2025-11-01: status set to pending by Boss Agent
- 2025-11-01: implemented ImageUpload component and integrated into PromptTemplatesPage by Codex
- 2025-11-01: adjusted upload endpoint to derive '/uploads' vs '/admin/uploads' based on axios baseURL
- 2025-11-01: finalized endpoint to '/uploads' (removed '/admin' segment) per backend
- 2025-11-01: updated spec to use `/api/uploads` and `/prompt-templates` (no `/admin` anywhere)
- 2025-11-01: updated Preview column to render inline thumbnail (no link)

## 8. Generated Files
- src/components/forms/ImageUpload.tsx
