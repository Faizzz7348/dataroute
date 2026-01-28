"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Delivery } from "@/app/data"
import { Trash2, Plus, Pencil, Save, ExternalLink } from "lucide-react"
import { useEditMode } from "@/contexts/edit-mode-context"

interface InfoModalProps {
  visible: boolean
  onHide: () => void
  rowData: Delivery | null
  onSave: (descriptions: Record<string, string>) => void
  isEditMode?: boolean
}

export function InfoModal({ visible, onHide, rowData, onSave, isEditMode = false }: InfoModalProps) {
  const { isEditMode: contextEditMode } = useEditMode()
  const actualEditMode = isEditMode || contextEditMode
  const [descriptions, setDescriptions] = React.useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = React.useState(false)
  const [newKey, setNewKey] = React.useState("")
  const [newValue, setNewValue] = React.useState("")
  
  // Shortcut dialog states
  const [showFamilyMartDialog, setShowFamilyMartDialog] = React.useState(false)
  const [showWebsiteDialog, setShowWebsiteDialog] = React.useState(false)
  const [showQRDialog, setShowQRDialog] = React.useState(false)
  const [showGoogleMapsDialog, setShowGoogleMapsDialog] = React.useState(false)
  const [showWazeDialog, setShowWazeDialog] = React.useState(false)
  const [websiteLink, setWebsiteLink] = React.useState("")
  const [qrCodeImageUrl, setQRCodeImageUrl] = React.useState("")
  const [qrCodeDestinationUrl, setQRCodeDestinationUrl] = React.useState("")
  const [googleMapsLink, setGoogleMapsLink] = React.useState("")
  const [wazeLink, setWazeLink] = React.useState("")
  const [uploadingQR, setUploadingQR] = React.useState(false)
  const [qrPreview, setQrPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [hasChanges, setHasChanges] = React.useState(false)

  React.useEffect(() => {
    if (visible && rowData) {
      const desc = rowData.descriptionsObj || {}
      setDescriptions(desc)
      setWebsiteLink(desc.websiteLink || "")
      setQRCodeImageUrl(desc.qrCodeImageUrl || "")
      setQRCodeDestinationUrl(desc.qrCodeDestinationUrl || "")
      setGoogleMapsLink(desc.googleMapsLink || "")
      setWazeLink(desc.wazeLink || "")
      setIsEditing(false)
      setNewKey("")
      setNewValue("")
      setHasChanges(false)
      setQrPreview(null)
    }
  }, [visible, rowData])

  const handleAddDescription = () => {
    if (newKey.trim() && newValue.trim()) {
      setDescriptions({
        ...descriptions,
        [newKey.trim()]: newValue.trim()
      })
      setNewKey("")
      setNewValue("")
      setHasChanges(true)
    }
  }

  const handleDeleteDescription = (key: string) => {
    const updated = { ...descriptions }
    delete updated[key]
    setDescriptions(updated)
    setHasChanges(true)
  }

  const handleUpdateDescription = (key: string, value: string) => {
    setDescriptions({
      ...descriptions,
      [key]: value
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    if (onSave) {
      const updatedDescriptions = {
        ...descriptions,
        websiteLink,
        qrCodeImageUrl,
        qrCodeDestinationUrl,
        googleMapsLink,
        wazeLink
      }
      onSave(updatedDescriptions)
    }
    setHasChanges(false)
    setIsEditing(false)
    onHide()
  }
  
  const handleShortcutClick = (type: string) => {
    if (!actualEditMode) {
      // Show confirmation dialog before opening link
      if (type === 'familymart') {
        setShowFamilyMartDialog(true)
      } else if (type === 'googlemaps') {
        setShowGoogleMapsDialog(true)
      } else if (type === 'waze') {
        setShowWazeDialog(true)
      } else if (type === 'website') {
        setShowWebsiteDialog(true)
      } else if (type === 'qrcode') {
        setShowQRDialog(true)
      }
    } else {
      // Open edit dialog if in edit mode
      if (type === 'familymart') {
        setShowFamilyMartDialog(true)
      } else if (type === 'googlemaps') {
        setShowGoogleMapsDialog(true)
      } else if (type === 'waze') {
        setShowWazeDialog(true)
      } else if (type === 'website') {
        setShowWebsiteDialog(true)
      } else if (type === 'qrcode') {
        setShowQRDialog(true)
      }
    }
  }

  const confirmAndOpenLink = (type: string) => {
    if (type === 'familymart' && rowData?.code && !isNaN(Number(rowData.code))) {
      const formattedCode = rowData.code.toString().padStart(4, '0')
      window.open(`https://fmvending.web.app/refill-service/M${formattedCode}`, '_blank')
      setShowFamilyMartDialog(false)
    } else if (type === 'googlemaps') {
      // Use custom link if available, otherwise use coordinates
      let url = googleMapsLink
      if (!url && rowData?.lat && rowData?.lng) {
        url = `https://www.google.com/maps/search/?api=1&query=${rowData.lat},${rowData.lng}`
      }
      if (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
        window.open(url, '_blank')
      }
      setShowGoogleMapsDialog(false)
    } else if (type === 'waze') {
      // Use custom link if available, otherwise use coordinates
      let url = wazeLink
      if (!url && rowData?.lat && rowData?.lng) {
        url = `https://www.waze.com/ul?ll=${rowData.lat},${rowData.lng}&navigate=yes`
      }
      if (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url
        }
        window.open(url, '_blank')
      }
      setShowWazeDialog(false)
    } else if (type === 'website' && websiteLink) {
      let url = websiteLink
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      window.open(url, '_blank')
      setShowWebsiteDialog(false)
    } else if (type === 'qrcode' && qrCodeDestinationUrl) {
      window.open(qrCodeDestinationUrl, '_blank')
      setShowQRDialog(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && actualEditMode) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
    }
    const desc = rowData?.descriptionsObj || {}
    setDescriptions(desc)
    setWebsiteLink(desc.websiteLink || "")
    setQRCodeImageUrl(desc.qrCodeImageUrl || "")
    setQRCodeDestinationUrl(desc.qrCodeDestinationUrl || "")
    setGoogleMapsLink(desc.googleMapsLink || "")
    setWazeLink(desc.wazeLink || "")
    setNewKey("")
    setNewValue("")
    setIsEditing(false)
    setHasChanges(false)
    setQrPreview(null)
    onHide()
  }

  return (
    <Dialog open={visible} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 info-modal-card" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Location Details</DialogTitle>
        <div className="info-modal-card-header">
          <h2 className="info-modal-card-title">Location Details</h2>
          <div className="info-modal-card-subtitle">
            <span className="info-modal-card-code">
              {rowData?.code}
            </span>
            <span className="info-modal-card-location">{rowData?.location || 'Location'}</span>
          </div>
        </div>
        <div className="info-modal-card-body max-h-[calc(85vh-220px)] overflow-y-auto">{/* Descriptions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <Label className="text-base font-semibold">Information</Label>
              </div>
              {!isEditing && actualEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 px-3"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>

            {/* Description Items */}
            <div className="space-y-2">
              {Object.keys(descriptions).length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? "Add information using the fields below" : "No information available"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {Object.entries(descriptions)
                    .filter(([key]) => {
                      // Hide these keys in view mode
                      if (!isEditing && !actualEditMode) {
                        const hiddenKeys = ['websiteLink', 'qrCodeImageUrl', 'qrCodeDestinationUrl', 'googleMapsLink', 'wazeLink'];
                        return !hiddenKeys.includes(key);
                      }
                      return true;
                    })
                    .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-[140px_1fr] gap-4 items-center">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {key}
                        </span>
                        {isEditing ? (
                          <Input
                            value={value}
                            onChange={(e) => handleUpdateDescription(key, e.target.value)}
                            className="text-sm h-9"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {value}
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDescription(key)}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Description */}
            {isEditing && (
              <div className="pt-2">
                <div className="flex gap-2">
                  <Input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Label (e.g., Phone)"
                    className="flex-1 h-10"
                  />
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value (e.g., +60123456789)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddDescription()
                      }
                    }}
                    className="flex-1 h-10"
                  />
                  <Button
                    onClick={handleAddDescription}
                    disabled={!newKey.trim() || !newValue.trim()}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Shortcuts Section - 100% Implementation from Reference Repo */}
          <div className="shortcuts-section-info-modal">
            <h3 className="shortcuts-title-info-modal">
              Shortcuts
            </h3>
            <div className="shortcuts-buttons-grid">
              {/* FamilyMart Button - Only if code is numeric */}
              {(() => {
                const code = rowData?.code
                if (!code || code.toString().trim() === '') return null
                const isNumeric = /^\d+$/.test(code.toString().trim())
                if (!isNumeric) return null
                const formattedCode = code.toString().trim().padStart(4, '0')
                const familyMartLink = `https://fmvending.web.app/refill-service/M${formattedCode}`
                
                return (
                  <a
                    href={familyMartLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shortcut-icon-only"
                    title="FamilyMart Refill"
                  >
                    <Image 
                      src="/FamilyMart.png" 
                      alt="FamilyMart" 
                      width={48}
                      height={48}
                      className="shortcut-icon-img"
                    />
                  </a>
                )
              })()}
              
              {/* Google Maps Button */}
              {(() => {
                const lat = rowData?.lat
                const lng = rowData?.lng
                const isValidLat = lat && lat.toString().trim() !== '' && parseFloat(lat.toString()) !== 0
                const isValidLng = lng && lng.toString().trim() !== '' && parseFloat(lng.toString()) !== 0
                if (!isValidLat || !isValidLng) return null
                
                return (
                  <a
                    href={googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${rowData.lat},${rowData.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shortcut-btn shortcut-google-maps"
                    onClick={(e) => {
                      if (actualEditMode) {
                        e.preventDefault()
                        handleShortcutClick('googlemaps')
                      }
                    }}
                  >
                    <Image 
                      src="/Gmaps.png" 
                      alt="Google Maps" 
                      width={20}
                      height={20}
                      className="shortcut-icon-img"
                    />
                    <span className="shortcut-label">Google Maps</span>
                    {actualEditMode && (
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                    )}
                  </a>
                )
              })()}
              
              {/* Waze Button */}
              {(() => {
                const lat = rowData?.lat
                const lng = rowData?.lng
                const isValidLat = lat && lat.toString().trim() !== '' && parseFloat(lat.toString()) !== 0
                const isValidLng = lng && lng.toString().trim() !== '' && parseFloat(lng.toString()) !== 0
                if (!isValidLat || !isValidLng) return null
                
                return (
                  <a
                    href={wazeLink || `https://www.waze.com/ul?ll=${rowData.lat},${rowData.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shortcut-btn shortcut-waze"
                    onClick={(e) => {
                      if (actualEditMode) {
                        e.preventDefault()
                        handleShortcutClick('waze')
                      }
                    }}
                  >
                    <Image 
                      src="/waze_app_icon-logo_brandlogos.net_l82da.png" 
                      alt="Waze" 
                      width={20}
                      height={20}
                      className="shortcut-icon-img"
                    />
                    <span className="shortcut-label">Waze</span>
                    {actualEditMode && (
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                    )}
                  </a>
                )
              })()}
              
              {/* Website Link Button */}
              {(websiteLink || actualEditMode) && (
                <button
                  onClick={() => {
                    if (!actualEditMode && websiteLink) {
                      let url = websiteLink
                      if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url
                      }
                      window.open(url, '_blank')
                    } else {
                      handleShortcutClick('website')
                    }
                  }}
                  className={`shortcut-btn shortcut-website ${!websiteLink && actualEditMode ? 'opacity-50' : ''}`}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="shortcut-label">{websiteLink ? 'Website' : 'Add Website'}</span>
                  {actualEditMode && (
                    websiteLink ? (
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 ml-1" />
                    )
                  )}
                </button>
              )}
              
              {/* QR Code Button */}
              {(qrCodeImageUrl || actualEditMode) && (
                <button
                  onClick={() => {
                    if (!actualEditMode && qrCodeDestinationUrl) {
                      window.open(qrCodeDestinationUrl, '_blank')
                    } else {
                      handleShortcutClick('qrcode')
                    }
                  }}
                  className={`shortcut-btn shortcut-qr ${!qrCodeImageUrl && actualEditMode ? 'opacity-50' : ''}`}
                >
                  <Image 
                    src="/QRcodewoi.png" 
                    alt="QR Code" 
                    width={20}
                    height={20}
                    className="shortcut-icon-img"
                  />
                  <span className="shortcut-label">{qrCodeImageUrl ? 'QR Code' : 'Add QR Code'}</span>
                  {actualEditMode && (
                    qrCodeImageUrl ? (
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 ml-1" />
                    )
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Shortcut Edit Dialogs */}
          {/* FamilyMart Dialog */}
          <Dialog open={showFamilyMartDialog} onOpenChange={setShowFamilyMartDialog}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{actualEditMode ? 'FamilyMart Link' : 'Open FamilyMart Link?'}</DialogTitle>
                {!actualEditMode && (
                  <DialogDescription>
                    Do you want to open the FamilyMart refill service page?
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={rowData?.code || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Generated Link</Label>
                  <Input 
                    value={`https://fmvending.web.app/refill-service/M${rowData?.code?.toString().padStart(4, '0')}`}
                    disabled 
                  />
                </div>
                {actualEditMode && (
                  <p className="text-xs text-muted-foreground">
                    This link is automatically generated based on the machine code and cannot be edited.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFamilyMartDialog(false)}>
                  {actualEditMode ? 'Close' : 'Cancel'}
                </Button>
                {!actualEditMode && (
                  <Button onClick={() => confirmAndOpenLink('familymart')}>
                    Open Link
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Website Dialog */}
          <Dialog open={showWebsiteDialog} onOpenChange={setShowWebsiteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{actualEditMode ? 'Website Link' : 'Open Website?'}</DialogTitle>
                {!actualEditMode && (
                  <DialogDescription>
                    Do you want to open this website?
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input 
                    id="website-url"
                    value={websiteLink} 
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="https://example.com"
                    disabled={!actualEditMode}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="icon" onClick={() => setShowWebsiteDialog(false)} title="Cancel">
                  <Trash2 className="h-4 w-4" />
                </Button>
                {actualEditMode ? (
                  <Button size="icon" onClick={() => {
                    setHasChanges(true)
                    setShowWebsiteDialog(false)
                  }} title="Save">
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="icon" onClick={() => confirmAndOpenLink('website')} title="Open Link">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* QR Code Dialog */}
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{actualEditMode ? 'QR Code Settings' : 'Open QR Code Link?'}</DialogTitle>
                {!actualEditMode && (
                  <DialogDescription>
                    Do you want to open the QR code destination?
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                {actualEditMode && (
                  <>
                    <div className="space-y-2">
                      <Label>Upload QR Code Image</Label>
                      <div className="flex gap-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            
                            setUploadingQR(true)
                            try {
                              // Create preview
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setQrPreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                              
                              // Convert to base64 and store
                              const base64 = await new Promise<string>((resolve) => {
                                const r = new FileReader()
                                r.onloadend = () => resolve(r.result as string)
                                r.readAsDataURL(file)
                              })
                              
                              setQRCodeImageUrl(base64)
                            } catch (error) {
                              console.error('Error uploading QR code:', error)
                            } finally {
                              setUploadingQR(false)
                            }
                          }}
                          disabled={uploadingQR}
                          className="flex-1"
                        />
                        {qrCodeImageUrl && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setQRCodeImageUrl("")
                              setQrPreview(null)
                              if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                            title="Clear"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {uploadingQR && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      {(qrPreview || qrCodeImageUrl) && (
                        <div className="relative w-full max-w-xs mx-auto border rounded-lg p-4 bg-muted/20">
                          <Image
                            src={qrPreview || qrCodeImageUrl}
                            alt="QR Code Preview"
                            width={200}
                            height={200}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="qr-image-url">QR Code Image URL</Label>
                  <Input 
                    id="qr-image-url"
                    value={qrCodeImageUrl} 
                    onChange={(e) => {
                      setQRCodeImageUrl(e.target.value)
                      setQrPreview(e.target.value)
                    }}
                    placeholder="https://example.com/qrcode.png"
                    disabled={!actualEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qr-dest-url">Destination URL (when scanned)</Label>
                  <Input 
                    id="qr-dest-url"
                    value={qrCodeDestinationUrl} 
                    onChange={(e) => setQRCodeDestinationUrl(e.target.value)}
                    placeholder="https://example.com/destination"
                    disabled={!actualEditMode}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="icon" onClick={() => {
                  setShowQRDialog(false)
                  setQrPreview(null)
                }} title="Cancel">
                  <Trash2 className="h-4 w-4" />
                </Button>
                {actualEditMode ? (
                  <Button size="icon" onClick={() => {
                    setHasChanges(true)
                    setShowQRDialog(false)
                    setQrPreview(null)
                  }} title="Save" disabled={uploadingQR}>
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="icon" onClick={() => confirmAndOpenLink('qrcode')} title="Open Link">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Google Maps Dialog */}
          <Dialog open={showGoogleMapsDialog} onOpenChange={setShowGoogleMapsDialog}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{actualEditMode ? 'Google Maps Direction Link' : 'Open in Google Maps?'}</DialogTitle>
                <DialogDescription>
                  {actualEditMode ? 'Add a custom direction link or use auto-generated coordinates' : 'Do you want to open this location in Google Maps?'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={rowData?.location || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input value={rowData?.lat || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input value={rowData?.lng || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googlemaps-link">Custom Direction Link (Optional)</Label>
                  <Input 
                    id="googlemaps-link"
                    value={googleMapsLink} 
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    disabled={!actualEditMode}
                  />
                  <p className="text-xs text-muted-foreground">
                    {googleMapsLink ? 'Custom link will be used' : 'Auto-generated from coordinates if left empty'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGoogleMapsDialog(false)}>
                  Cancel
                </Button>
                {actualEditMode ? (
                  <Button onClick={() => {
                    setHasChanges(true)
                    setShowGoogleMapsDialog(false)
                  }}>
                    Save
                  </Button>
                ) : (
                  <Button onClick={() => confirmAndOpenLink('googlemaps')}>
                    Open in Google Maps
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Waze Dialog */}
          <Dialog open={showWazeDialog} onOpenChange={setShowWazeDialog}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{actualEditMode ? 'Waze Direction Link' : 'Open in Waze?'}</DialogTitle>
                <DialogDescription>
                  {actualEditMode ? 'Add a custom direction link or use auto-generated coordinates' : 'Do you want to navigate to this location using Waze?'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={rowData?.location || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input value={rowData?.lat || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input value={rowData?.lng || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waze-link">Custom Direction Link (Optional)</Label>
                  <Input 
                    id="waze-link"
                    value={wazeLink} 
                    onChange={(e) => setWazeLink(e.target.value)}
                    placeholder="https://waze.com/ul?ll=..."
                    disabled={!actualEditMode}
                  />
                  <p className="text-xs text-muted-foreground">
                    {wazeLink ? 'Custom link will be used' : 'Auto-generated from coordinates if left empty'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWazeDialog(false)}>
                  Cancel
                </Button>
                {actualEditMode ? (
                  <Button onClick={() => {
                    setHasChanges(true)
                    setShowWazeDialog(false)
                  }}>
                    Save
                  </Button>
                ) : (
                  <Button onClick={() => confirmAndOpenLink('waze')}>
                    Open in Waze
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="info-modal-card-footer">
          <Button variant="outline" onClick={handleCancel}>
            {hasChanges && actualEditMode ? 'Discard Changes' : 'Close'}
          </Button>
          {actualEditMode && (hasChanges || isEditing) && (
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
