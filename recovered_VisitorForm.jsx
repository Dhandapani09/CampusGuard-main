                      </select>
                      <input 
                        type="text" 
                        placeholder="Serial # / Details" 
                        value={acc.details} 
                        onChange={(e) => handleAccessoryChange(idx, 'details', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button type="button" className="btn-icon text-danger" onClick={() => removeAccessory(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Visit Details</h3>
            <div className="input-group">
              <label>Host / Meet With</label>
              <input type="text" name="host" value={formData.host} onChange={handleChange} placeholder="Search staff..." />
            </div>
            <div className="input-group">
              <label>Purpose of Visit</label>
              <textarea 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleChange} 
                rows={3} 
                required 
                placeholder="E.g., Meeting, Server Repair, Delivery..." 
              />
            </div>
            
            <AICheckPanel 
              visitorName={formData.name} 
              visitorPhone={formData.phone} 
              purpose={formData.purpose} 
            />
          </div>
        </div>

        <div className="form-col">
          <div className="form-section sticky-section">
            <h3>Identity Verification</h3>
            <WebcamCapture 
              onCapture={handlePhotoCapture} 
              skipped={formData.type === 'Customer'} 
            />
            
            <div className="form-actions mt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Generate Pass
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showToast && (
        <div className="toast-container">
          <Toast 
            type="warning" 
            message="Forgotten ID Protocol Initiated. An email has been sent to the Department Head and Security Manager." 
            onClose={() => setShowToast(false)} 
          />
        </div>
      )}
    </form>
  );
};

export default VisitorForm;

The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.