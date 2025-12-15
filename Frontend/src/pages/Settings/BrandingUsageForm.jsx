import React, { useState, useEffect } from "react";
import {
    Box,
    Stack,
    FormControlLabel,
    Checkbox,
    Button,
} from "@mui/material";
import { fetchSettings, updateBranding } from "../../api/authApi";


export default function BrandingUsageForm({ onClose }) {
    const [portal, setPortal] = useState(false);
    const [payslip, setPayslip] = useState(false);
    const [email, setEmail] = useState(false);
    const [letters, setLetters] = useState(false);

    useEffect(() => {
        let mounted = true;

        fetchSettings().then((res) => {
            if (!mounted) return;

            const usage = res.data?.branding?.usage;
            if (!usage) return;

            setPortal(usage.portal === true || usage.portal === "true");
            setPayslip(usage.payslip === true || usage.payslip === "true");
            setEmail(usage.email === true || usage.email === "true");
            setLetters(usage.letters === true || usage.letters === "true");
        });

        return () => {
            mounted = false;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const usage = {
            portal,
            payslip,
            email,
            letters,
        };

        await updateBranding({ usage });
        onClose();
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={portal} onChange={(e) => setPortal(e.target.checked)}
                        />
                    }
                    label="Apply branding to employee portal"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={payslip}
                            onChange={(e) => setPayslip(e.target.checked)}
                        />
                    }
                    label="Apply branding to payslips"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={email}
                            onChange={(e) => setEmail(e.target.checked)}
                        />
                    }
                    label="Apply branding to email templates"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={letters}
                            onChange={(e) => setLetter(e.target.checked)}
                        />
                    }
                    label="Apply branding to default letters"
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
